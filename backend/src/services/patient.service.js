"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientAppointments = exports.upsertPatientMedicalProfile = exports.getPatientMedicalProfile = exports.deletePatientEmergencyContact = exports.upsertPatientEmergencyContact = exports.getPatientEmergencyContact = exports.deactivatePatient = exports.deletePatient = exports.updatePatient = exports.createPatient = exports.getPatientById = exports.getPatients = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const prisma_1 = require("../config/prisma");
const audit_service_1 = require("./audit.service");
const getPatients = async () => {
    return prisma_1.prisma.patient.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.getPatients = getPatients;
const getPatientById = async (id) => {
    return prisma_1.prisma.patient.findUnique({
        where: { id },
    });
};
exports.getPatientById = getPatientById;
const createPatient = async (data, auditContext) => {
    const created = await prisma_1.prisma.patient.create({
        data,
    });
    if (auditContext) {
        await (0, audit_service_1.safeRecordAuditEvent)({
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
exports.createPatient = createPatient;
const updatePatient = async (id, data, auditContext) => {
    const updated = await prisma_1.prisma.patient.update({
        where: { id },
        data,
    });
    if (auditContext) {
        await (0, audit_service_1.safeRecordAuditEvent)({
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
exports.updatePatient = updatePatient;
const deletePatient = async (id) => {
    const patient = await prisma_1.prisma.patient.findUnique({
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
    await prisma_1.prisma.$transaction(async (tx) => {
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
        if (patient.userId !== null) {
            await tx.user.delete({
                where: { id: patient.userId },
            });
        }
    });
    return patient;
};
exports.deletePatient = deletePatient;
const deactivatePatient = async (patientId, auditContext) => {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: {
            id: patientId,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    if (patient.status === "INACTIVE") {
        throw new Error("PATIENT_ALREADY_INACTIVE");
    }
    const updated = await prisma_1.prisma.patient.update({
        where: {
            id: patientId,
        },
        data: {
            status: "INACTIVE",
        },
    });
    if (auditContext) {
        await (0, audit_service_1.safeRecordAuditEvent)({
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
exports.deactivatePatient = deactivatePatient;
/*
|--------------------------------------------------------------------------
| Emergency Contact
|--------------------------------------------------------------------------
*/
const getPatientEmergencyContact = async (patientId) => {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: {
            id: patientId,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.patientEmergencyContact.findUnique({
        where: {
            patientId,
        },
    });
};
exports.getPatientEmergencyContact = getPatientEmergencyContact;
const upsertPatientEmergencyContact = async (patientId, data) => {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: {
            id: patientId,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.patientEmergencyContact.upsert({
        where: {
            patientId,
        },
        update: {
            firstName: data.firstName,
            lastName: data.lastName,
            relationship: data.relationship,
            phone: data.phone,
            alternatePhone: data.alternatePhone || null,
            email: data.email || null,
            address: data.address || null,
        },
        create: {
            patientId,
            firstName: data.firstName,
            lastName: data.lastName,
            relationship: data.relationship,
            phone: data.phone,
            alternatePhone: data.alternatePhone || null,
            email: data.email || null,
            address: data.address || null,
        },
    });
};
exports.upsertPatientEmergencyContact = upsertPatientEmergencyContact;
const deletePatientEmergencyContact = async (patientId) => {
    const contact = await prisma_1.prisma.patientEmergencyContact.findUnique({
        where: {
            patientId,
        },
    });
    if (!contact) {
        throw new Error("EMERGENCY_CONTACT_NOT_FOUND");
    }
    await prisma_1.prisma.patientEmergencyContact.delete({
        where: {
            patientId,
        },
    });
    return {
        message: "Emergency contact deleted successfully",
    };
};
exports.deletePatientEmergencyContact = deletePatientEmergencyContact;
/*
|--------------------------------------------------------------------------
| Medical Profile
|--------------------------------------------------------------------------
*/
const getPatientMedicalProfile = async (patientId) => {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: {
            id: patientId,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.patientMedicalProfile.findUnique({
        where: {
            patientId,
        },
    });
};
exports.getPatientMedicalProfile = getPatientMedicalProfile;
const upsertPatientMedicalProfile = async (patientId, data) => {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: {
            id: patientId,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.patientMedicalProfile.upsert({
        where: {
            patientId,
        },
        update: {
            medicalConditions: data.medicalConditions?.trim() ||
                null,
            allergies: data.allergies?.trim() ||
                null,
            currentMedications: data.currentMedications?.trim() ||
                null,
            medicalNotes: data.medicalNotes?.trim() ||
                null,
        },
        create: {
            patientId,
            medicalConditions: data.medicalConditions?.trim() ||
                null,
            allergies: data.allergies?.trim() ||
                null,
            currentMedications: data.currentMedications?.trim() ||
                null,
            medicalNotes: data.medicalNotes?.trim() ||
                null,
        },
    });
};
exports.upsertPatientMedicalProfile = upsertPatientMedicalProfile;
/*
|--------------------------------------------------------------------------
| Patient Appointment History
|--------------------------------------------------------------------------
*/
const getPatientAppointments = async (patientId) => {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: {
            id: patientId,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.appointment.findMany({
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
exports.getPatientAppointments = getPatientAppointments;
//# sourceMappingURL=patient.service.js.map