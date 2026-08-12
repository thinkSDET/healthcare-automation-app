/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { prisma } from "../config/prisma";
import {
  safeRecordAuditEvent,
  type AuditContext,
} from "./audit.service";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface PrescriptionItemInput {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string;
  instructions?: string;
}

interface CreatePrescriptionInput {
  patientId: number;
  doctorId: number;
  prescribedAt?: string;
  diagnosis?: string;
  notes?: string;
  status?: "ACTIVE" | "COMPLETED" | "CANCELLED";
  items: PrescriptionItemInput[];
}

/*
|--------------------------------------------------------------------------
| Get Patient Prescriptions
|--------------------------------------------------------------------------
*/

export const getPatientPrescriptions =
  async (patientId: number) => {

    const patient =
      await prisma.patient.findUnique({
        where: {
          id: patientId,
        },
      });

    if (!patient) {
      throw new Error(
        "PATIENT_NOT_FOUND"
      );
    }

    return prisma.prescription.findMany({
      where: {
        patientId,
      },

      include: {
        doctor: {
          select: {
            id: true,
            doctorCode: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },

        items: true,
      },

      orderBy: {
        prescribedAt: "desc",
      },
    });
  };


/*
|--------------------------------------------------------------------------
| Get Prescription By ID
|--------------------------------------------------------------------------
*/

export const getPrescriptionById =
  async (prescriptionId: number) => {

    const prescription =
      await prisma.prescription.findUnique({
        where: {
          id: prescriptionId,
        },

        include: {
          patient: {
            select: {
              id: true,
              medicalId: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
            },
          },

          doctor: {
            select: {
              id: true,
              doctorCode: true,
              firstName: true,
              lastName: true,
              specialization: true,
              licenseNumber: true,
            },
          },

          items: true,
        },
      });

    if (!prescription) {
      throw new Error(
        "PRESCRIPTION_NOT_FOUND"
      );
    }

    return prescription;
  };


/*
|--------------------------------------------------------------------------
| Create Prescription
|--------------------------------------------------------------------------
*/

export const createPrescription =
  async (
    data: CreatePrescriptionInput,
    auditContext?: AuditContext
  ) => {

    const patient =
      await prisma.patient.findUnique({
        where: {
          id: data.patientId,
        },
      });

    if (!patient) {
      throw new Error(
        "PATIENT_NOT_FOUND"
      );
    }

    const doctor =
      await prisma.doctor.findUnique({
        where: {
          id: data.doctorId,
        },
      });

    if (!doctor) {
      throw new Error(
        "DOCTOR_NOT_FOUND"
      );
    }

    if (
      !data.items ||
      data.items.length === 0
    ) {
      throw new Error(
        "PRESCRIPTION_ITEMS_REQUIRED"
      );
    }

    for (const item of data.items) {

      if (
        !item.medicineName?.trim() ||
        !item.dosage?.trim() ||
        !item.frequency?.trim() ||
        !item.duration?.trim()
      ) {
        throw new Error(
          "INVALID_PRESCRIPTION_ITEM"
        );
      }
    }

    const prescriptionNo =
      `RX-${Date.now()}`;

    const created = await prisma.prescription.create({
      data: {

        prescriptionNo,

        patientId:
          data.patientId,

        doctorId:
          data.doctorId,

        prescribedAt:
          data.prescribedAt
            ? new Date(
                data.prescribedAt
              )
            : new Date(),

        diagnosis:
          data.diagnosis?.trim() ||
          null,

        notes:
          data.notes?.trim() ||
          null,

        status:
          data.status ||
          "ACTIVE",

        items: {
          create:
            data.items.map(
              (item) => ({
                medicineName:
                  item.medicineName.trim(),

                dosage:
                  item.dosage.trim(),

                frequency:
                  item.frequency.trim(),

                duration:
                  item.duration.trim(),

                route:
                  item.route?.trim() ||
                  null,

                instructions:
                  item.instructions?.trim() ||
                  null,
              })
            ),
        },
      },

      include: {
        patient: {
          select: {
            id: true,
            medicalId: true,
            firstName: true,
            lastName: true,
          },
        },

        doctor: {
          select: {
            id: true,
            doctorCode: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },

        items: true,
      },
    });

    if (auditContext) {
      await safeRecordAuditEvent({
        actorUserId: auditContext.actorUserId,
        actorRole: auditContext.actorRole,
        action: "CREATE",
        entityType: "PRESCRIPTION",
        entityId: created.id,
        metadata: {
          prescriptionNo: created.prescriptionNo,
          patientId: created.patientId,
          doctorId: created.doctorId,
        },
      });
    }

    return created;
  };


/*
|--------------------------------------------------------------------------
| Update Prescription Status
|--------------------------------------------------------------------------
*/

export const updatePrescriptionStatus =
  async (
    prescriptionId: number,
    status:
      | "ACTIVE"
      | "COMPLETED"
      | "CANCELLED",
    auditContext?: AuditContext
  ) => {

    const prescription =
      await prisma.prescription.findUnique({
        where: {
          id: prescriptionId,
        },
      });

    if (!prescription) {
      throw new Error(
        "PRESCRIPTION_NOT_FOUND"
      );
    }

    const updated = await prisma.prescription.update({
      where: {
        id: prescriptionId,
      },

      data: {
        status,
      },

      include: {
        items: true,

        doctor: {
          select: {
            id: true,
            doctorCode: true,
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
    });

    if (auditContext) {
      await safeRecordAuditEvent({
        actorUserId: auditContext.actorUserId,
        actorRole: auditContext.actorRole,
        action: "STATUS_CHANGE",
        entityType: "PRESCRIPTION",
        entityId: updated.id,
        metadata: {
          prescriptionNo: updated.prescriptionNo,
          from: prescription.status,
          to: status,
        },
      });
    }

    return updated;
  };


/*
|--------------------------------------------------------------------------
| Delete Prescription
|--------------------------------------------------------------------------
*/

export const deletePrescription =
  async (
    prescriptionId: number,
    auditContext?: AuditContext
  ) => {

    const prescription =
      await prisma.prescription.findUnique({
        where: {
          id: prescriptionId,
        },
      });

    if (!prescription) {
      throw new Error(
        "PRESCRIPTION_NOT_FOUND"
      );
    }

    await prisma.prescription.delete({
      where: {
        id: prescriptionId,
      },
    });

    if (auditContext) {
      await safeRecordAuditEvent({
        actorUserId: auditContext.actorUserId,
        actorRole: auditContext.actorRole,
        action: "DELETE",
        entityType: "PRESCRIPTION",
        entityId: prescriptionId,
        metadata: {
          prescriptionNo: prescription.prescriptionNo,
          patientId: prescription.patientId,
        },
      });
    }

    return {
      message:
        "Prescription deleted successfully",
    };
  };