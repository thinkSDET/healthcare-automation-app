"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDoctor = exports.updateDoctor = exports.createDoctor = exports.getDoctorById = exports.getDoctors = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const prisma_1 = require("../config/prisma");
const getDoctors = async (options) => {
    return prisma_1.prisma.doctor.findMany({
        where: options?.activeOnly
            ? { status: "ACTIVE" }
            : undefined,
        orderBy: {
            createdAt: "desc"
        }
    });
};
exports.getDoctors = getDoctors;
const getDoctorById = async (id) => {
    return prisma_1.prisma.doctor.findUnique({
        where: { id }
    });
};
exports.getDoctorById = getDoctorById;
const createDoctor = async (data) => {
    return prisma_1.prisma.doctor.create({
        data
    });
};
exports.createDoctor = createDoctor;
const updateDoctor = async (id, data) => {
    return prisma_1.prisma.doctor.update({
        where: { id },
        data
    });
};
exports.updateDoctor = updateDoctor;
const deleteDoctor = async (id) => {
    return prisma_1.prisma.doctor.delete({
        where: { id }
    });
};
exports.deleteDoctor = deleteDoctor;
//# sourceMappingURL=doctor.service.js.map