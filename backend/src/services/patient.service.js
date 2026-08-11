"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatientAppointments = exports.upsertPatientMedicalProfile = exports.getPatientMedicalProfile = exports.deletePatientEmergencyContact = exports.upsertPatientEmergencyContact = exports.getPatientEmergencyContact = exports.deactivatePatient = exports.deletePatient = exports.updatePatient = exports.createPatient = exports.getPatientById = exports.getPatients = void 0;
const prisma_1 = require("../config/prisma");
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
const createPatient = async (data) => {
    return prisma_1.prisma.patient.create({
        data,
    });
};
exports.createPatient = createPatient;
const updatePatient = async (id, data) => {
    return prisma_1.prisma.patient.update({
        where: { id },
        data,
    });
};
exports.updatePatient = updatePatient;
const deletePatient = async (id) => {
    return prisma_1.prisma.patient.delete({
        where: { id },
    });
};
exports.deletePatient = deletePatient;
const deactivatePatient = async (patientId) => {
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
    return prisma_1.prisma.patient.update({
        where: {
            id: patientId,
        },
        data: {
            status: "INACTIVE",
        },
    });
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