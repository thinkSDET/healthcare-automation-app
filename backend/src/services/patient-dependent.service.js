"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDependent = exports.createDependent = exports.getDependents = void 0;
const prisma_1 = require("../config/prisma");
const getDependents = async (patientId) => {
    return prisma_1.prisma.patientDependent.findMany({
        where: {
            patientId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.getDependents = getDependents;
const createDependent = async (patientId, data) => {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: {
            id: patientId,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.patientDependent.create({
        data: {
            patientId,
            firstName: data.firstName,
            lastName: data.lastName,
            relationship: data.relationship,
            dateOfBirth: data.dateOfBirth
                ? new Date(data.dateOfBirth)
                : undefined,
            gender: data.gender
                ? data.gender
                : undefined,
            phone: data.phone || undefined,
            email: data.email || undefined,
        },
    });
};
exports.createDependent = createDependent;
const deleteDependent = async (dependentId) => {
    const dependent = await prisma_1.prisma.patientDependent.findUnique({
        where: {
            id: dependentId,
        },
    });
    if (!dependent) {
        throw new Error("DEPENDENT_NOT_FOUND");
    }
    await prisma_1.prisma.patientDependent.delete({
        where: {
            id: dependentId,
        },
    });
    return {
        message: "Dependent removed successfully",
    };
};
exports.deleteDependent = deleteDependent;
//# sourceMappingURL=patient-dependent.service.js.map