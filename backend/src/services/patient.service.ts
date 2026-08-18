/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { prisma } from "../config/prisma";
import {
  safeRecordAuditEvent,
  type AuditContext,
} from "./audit.service";

export const getPatients = async () => {
  return prisma.patient.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getPatientById = async (id: number) => {
  return prisma.patient.findUnique({
    where: { id },
  });
};

export const createPatient = async (
  data: {
    medicalId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: "MALE" | "FEMALE" | "OTHER";
    email?: string;
    phone: string;
    address?: string;
    bloodGroup?: string;
  },
  auditContext?: AuditContext
) => {
  const created = await prisma.patient.create({
    data,
  });

  if (auditContext) {
    await safeRecordAuditEvent({
      actorUserId: auditContext.actorUserId,
      actorRole: auditContext.actorRole,
      action: "CREATE",
      entityType: "PATIENT",
      entityId: created.id,
      metadata: {
        medicalId: created.medicalId,
      },
    });
  }

  return created;
};

export const updatePatient = async (
  id: number,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    bloodGroup?: string;
    status?: "ACTIVE" | "INACTIVE" | "DECEASED";
  },
  auditContext?: AuditContext
) => {
  const updated = await prisma.patient.update({
    where: { id },
    data,
  });

  if (auditContext) {
    await safeRecordAuditEvent({
      actorUserId: auditContext.actorUserId,
      actorRole: auditContext.actorRole,
      action: "UPDATE",
      entityType: "PATIENT",
      entityId: updated.id,
      metadata: {
        medicalId: updated.medicalId,
        updatedFields: Object.keys(data),
      },
    });
  }

  return updated;
};

export const deletePatient = async (id: number) => {
  const patient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  if (patient.status !== "INACTIVE") {
    throw new Error("PATIENT_MUST_BE_INACTIVE");
  }

  // Some patient relations are not configured with database-level cascade
  // deletes (for example appointments). Remove those records first so the
  // patient delete does not fail on foreign-key constraints.
  await prisma.$transaction(async (tx) => {
    await tx.appointmentRequest.deleteMany({
      where: { patientId: id },
    });

    await tx.labTestOrder.deleteMany({
      where: { patientId: id },
    });

    await tx.appointment.deleteMany({
      where: { patientId: id },
    });

    await tx.patient.delete({
      where: { id },
    });
  });

  return patient;
};

export const deactivatePatient = async (
  patientId: number,
  auditContext?: AuditContext
) => {
  const patient =
    await prisma.patient.findUnique({
      where: {
        id: patientId,
      },
    });

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  if (patient.status === "INACTIVE") {
    throw new Error(
      "PATIENT_ALREADY_INACTIVE"
    );
  }

  const updated = await prisma.patient.update({
    where: {
      id: patientId,
    },
    data: {
      status: "INACTIVE",
    },
  });

  if (auditContext) {
    await safeRecordAuditEvent({
      actorUserId: auditContext.actorUserId,
      actorRole: auditContext.actorRole,
      action: "STATUS_CHANGE",
      entityType: "PATIENT",
      entityId: updated.id,
      metadata: {
        medicalId: updated.medicalId,
        from: patient.status,
        to: "INACTIVE",
      },
    });
  }

  return updated;
};

/*
|--------------------------------------------------------------------------
| Emergency Contact
|--------------------------------------------------------------------------
*/

export const getPatientEmergencyContact = async (
  patientId: number
) => {
  const patient =
    await prisma.patient.findUnique({
      where: {
        id: patientId,
      },
    });

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  return prisma.patientEmergencyContact.findUnique({
    where: {
      patientId,
    },
  });
};

export const upsertPatientEmergencyContact = async (
  patientId: number,
  data: {
    firstName: string;
    lastName: string;
    relationship: string;
    phone: string;
    alternatePhone?: string;
    email?: string;
    address?: string;
  }
) => {
  const patient =
    await prisma.patient.findUnique({
      where: {
        id: patientId,
      },
    });

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  return prisma.patientEmergencyContact.upsert({
    where: {
      patientId,
    },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      relationship: data.relationship,
      phone: data.phone,
      alternatePhone:
        data.alternatePhone || null,
      email: data.email || null,
      address: data.address || null,
    },
    create: {
      patientId,
      firstName: data.firstName,
      lastName: data.lastName,
      relationship: data.relationship,
      phone: data.phone,
      alternatePhone:
        data.alternatePhone || null,
      email: data.email || null,
      address: data.address || null,
    },
  });
};

export const deletePatientEmergencyContact =
  async (patientId: number) => {
    const contact =
      await prisma.patientEmergencyContact.findUnique({
        where: {
          patientId,
        },
      });

    if (!contact) {
      throw new Error(
        "EMERGENCY_CONTACT_NOT_FOUND"
      );
    }

    await prisma.patientEmergencyContact.delete({
      where: {
        patientId,
      },
    });

    return {
      message:
        "Emergency contact deleted successfully",
    };
  };

  /*
|--------------------------------------------------------------------------
| Medical Profile
|--------------------------------------------------------------------------
*/

export const getPatientMedicalProfile = async (
  patientId: number
) => {
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

  return prisma.patientMedicalProfile.findUnique({
    where: {
      patientId,
    },
  });
};

export const upsertPatientMedicalProfile =
  async (
    patientId: number,
    data: {
      medicalConditions?: string;
      allergies?: string;
      currentMedications?: string;
      medicalNotes?: string;
    }
  ) => {
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

    return prisma.patientMedicalProfile.upsert({
      where: {
        patientId,
      },

      update: {
        medicalConditions:
          data.medicalConditions?.trim() ||
          null,

        allergies:
          data.allergies?.trim() ||
          null,

        currentMedications:
          data.currentMedications?.trim() ||
          null,

        medicalNotes:
          data.medicalNotes?.trim() ||
          null,
      },

      create: {
        patientId,

        medicalConditions:
          data.medicalConditions?.trim() ||
          null,

        allergies:
          data.allergies?.trim() ||
          null,

        currentMedications:
          data.currentMedications?.trim() ||
          null,

        medicalNotes:
          data.medicalNotes?.trim() ||
          null,
      },
    });
  };

  /*
|--------------------------------------------------------------------------
| Patient Appointment History
|--------------------------------------------------------------------------
*/

export const getPatientAppointments = async (
  patientId: number
) => {
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

  return prisma.appointment.findMany({
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
    },

    orderBy: {
      appointmentAt: "desc",
    },
  });
};