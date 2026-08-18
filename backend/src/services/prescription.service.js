"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePrescription = exports.updatePrescriptionStatus = exports.createPrescription = exports.getPrescriptionById = exports.getPatientPrescriptions = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const prisma_1 = require("../config/prisma");
const audit_service_1 = require("./audit.service");
/*
|--------------------------------------------------------------------------
| Get Patient Prescriptions
|--------------------------------------------------------------------------
*/
const getPatientPrescriptions = async (patientId) => {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: {
            id: patientId,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.prescription.findMany({
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
exports.getPatientPrescriptions = getPatientPrescriptions;
/*
|--------------------------------------------------------------------------
| Get Prescription By ID
|--------------------------------------------------------------------------
*/
const getPrescriptionById = async (prescriptionId) => {
    const prescription = await prisma_1.prisma.prescription.findUnique({
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
        throw new Error("PRESCRIPTION_NOT_FOUND");
    }
    return prescription;
};
exports.getPrescriptionById = getPrescriptionById;
/*
|--------------------------------------------------------------------------
| Create Prescription
|--------------------------------------------------------------------------
*/
const createPrescription = async (data, auditContext) => {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: {
            id: data.patientId,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    const doctor = await prisma_1.prisma.doctor.findUnique({
        where: {
            id: data.doctorId,
        },
    });
    if (!doctor) {
        throw new Error("DOCTOR_NOT_FOUND");
    }
    if (!data.items ||
        data.items.length === 0) {
        throw new Error("PRESCRIPTION_ITEMS_REQUIRED");
    }
    for (const item of data.items) {
        if (!item.medicineName?.trim() ||
            !item.dosage?.trim() ||
            !item.frequency?.trim() ||
            !item.duration?.trim()) {
            throw new Error("INVALID_PRESCRIPTION_ITEM");
        }
    }
    const prescriptionNo = `RX-${Date.now()}`;
    const created = await prisma_1.prisma.prescription.create({
        data: {
            prescriptionNo,
            patientId: data.patientId,
            doctorId: data.doctorId,
            prescribedAt: data.prescribedAt
                ? new Date(data.prescribedAt)
                : new Date(),
            diagnosis: data.diagnosis?.trim() ||
                null,
            notes: data.notes?.trim() ||
                null,
            status: data.status ||
                "ACTIVE",
            items: {
                create: data.items.map((item) => ({
                    medicineName: item.medicineName.trim(),
                    dosage: item.dosage.trim(),
                    frequency: item.frequency.trim(),
                    duration: item.duration.trim(),
                    route: item.route?.trim() ||
                        null,
                    instructions: item.instructions?.trim() ||
                        null,
                })),
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
        await (0, audit_service_1.safeRecordAuditEvent)({
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
exports.createPrescription = createPrescription;
/*
|--------------------------------------------------------------------------
| Update Prescription Status
|--------------------------------------------------------------------------
*/
const updatePrescriptionStatus = async (prescriptionId, status, auditContext) => {
    const prescription = await prisma_1.prisma.prescription.findUnique({
        where: {
            id: prescriptionId,
        },
    });
    if (!prescription) {
        throw new Error("PRESCRIPTION_NOT_FOUND");
    }
    const updated = await prisma_1.prisma.prescription.update({
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
        await (0, audit_service_1.safeRecordAuditEvent)({
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
exports.updatePrescriptionStatus = updatePrescriptionStatus;
/*
|--------------------------------------------------------------------------
| Delete Prescription
|--------------------------------------------------------------------------
*/
const deletePrescription = async (prescriptionId, auditContext) => {
    const prescription = await prisma_1.prisma.prescription.findUnique({
        where: {
            id: prescriptionId,
        },
    });
    if (!prescription) {
        throw new Error("PRESCRIPTION_NOT_FOUND");
    }
    await prisma_1.prisma.prescription.delete({
        where: {
            id: prescriptionId,
        },
    });
    if (auditContext) {
        await (0, audit_service_1.safeRecordAuditEvent)({
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
        message: "Prescription deleted successfully",
    };
};
exports.deletePrescription = deletePrescription;
//# sourceMappingURL=prescription.service.js.map