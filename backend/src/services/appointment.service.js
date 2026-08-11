"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelAppointment = exports.updateAppointment = exports.createAppointment = exports.getAppointmentById = exports.getAppointments = void 0;
const prisma_1 = require("../config/prisma");
const ACTIVE_STATUSES = {
    notIn: ["CANCELLED", "NO_SHOW"],
};
const getEndTime = (startTime, duration) => {
    return new Date(startTime.getTime() + duration * 60 * 1000);
};
const appointmentsOverlap = (startA, durationA, startB, durationB) => {
    const endA = getEndTime(startA, durationA);
    const endB = getEndTime(startB, durationB);
    return (startA < endB &&
        endA > startB);
};
const getAppointments = async () => {
    return prisma_1.prisma.appointment.findMany({
        include: {
            patient: true,
            doctor: true,
        },
        orderBy: {
            appointmentAt: "asc",
        },
    });
};
exports.getAppointments = getAppointments;
const getAppointmentById = async (id) => {
    return prisma_1.prisma.appointment.findUnique({
        where: { id },
        include: {
            patient: true,
            doctor: true,
        },
    });
};
exports.getAppointmentById = getAppointmentById;
const createAppointment = async (data) => {
    const duration = data.duration ?? 30;
    // -----------------------------------------
    // Basic validation
    // -----------------------------------------
    if (duration <= 0) {
        throw new Error("Appointment duration must be greater than 0");
    }
    if (data.appointmentAt < new Date()) {
        throw new Error("Appointment cannot be scheduled in the past");
    }
    // -----------------------------------------
    // Get active appointments for doctor
    // -----------------------------------------
    const doctorAppointments = await prisma_1.prisma.appointment.findMany({
        where: {
            doctorId: data.doctorId,
            status: ACTIVE_STATUSES,
        },
    });
    // -----------------------------------------
    // Doctor conflict check
    // -----------------------------------------
    const doctorConflict = doctorAppointments.some((appointment) => appointmentsOverlap(data.appointmentAt, duration, appointment.appointmentAt, appointment.duration ?? 30));
    if (doctorConflict) {
        throw new Error("Doctor already has an overlapping appointment");
    }
    // -----------------------------------------
    // Get active appointments for patient
    // -----------------------------------------
    const patientAppointments = await prisma_1.prisma.appointment.findMany({
        where: {
            patientId: data.patientId,
            status: ACTIVE_STATUSES,
        },
    });
    // -----------------------------------------
    // Patient conflict check
    // -----------------------------------------
    const patientConflict = patientAppointments.some((appointment) => appointmentsOverlap(data.appointmentAt, duration, appointment.appointmentAt, appointment.duration ?? 30));
    if (patientConflict) {
        throw new Error("Patient already has an overlapping appointment");
    }
    // -----------------------------------------
    // Create appointment
    // -----------------------------------------
    return prisma_1.prisma.appointment.create({
        data: {
            ...data,
            duration,
        },
    });
};
exports.createAppointment = createAppointment;
const updateAppointment = async (id, data) => {
    // -----------------------------------------
    // Get existing appointment
    // -----------------------------------------
    const existingAppointment = await prisma_1.prisma.appointment.findUnique({
        where: { id },
    });
    if (!existingAppointment) {
        throw new Error("Appointment not found");
    }
    // -----------------------------------------
    // If appointment is being cancelled/no-show,
    // no conflict validation is required.
    // -----------------------------------------
    if (data.status === "CANCELLED" ||
        data.status === "NO_SHOW") {
        return prisma_1.prisma.appointment.update({
            where: { id },
            data,
        });
    }
    const newStart = data.appointmentAt ??
        existingAppointment.appointmentAt;
    const newDuration = data.duration ??
        existingAppointment.duration ??
        30;
    // -----------------------------------------
    // Basic validation
    // -----------------------------------------
    if (newDuration <= 0) {
        throw new Error("Appointment duration must be greater than 0");
    }
    if (newStart < new Date()) {
        throw new Error("Appointment cannot be scheduled in the past");
    }
    // -----------------------------------------
    // Check doctor conflicts
    // -----------------------------------------
    const doctorAppointments = await prisma_1.prisma.appointment.findMany({
        where: {
            doctorId: existingAppointment.doctorId,
            id: {
                not: id,
            },
            status: ACTIVE_STATUSES,
        },
    });
    const doctorConflict = doctorAppointments.some((appointment) => appointmentsOverlap(newStart, newDuration, appointment.appointmentAt, appointment.duration ?? 30));
    if (doctorConflict) {
        throw new Error("Doctor already has an overlapping appointment");
    }
    // -----------------------------------------
    // Check patient conflicts
    // -----------------------------------------
    const patientAppointments = await prisma_1.prisma.appointment.findMany({
        where: {
            patientId: existingAppointment.patientId,
            id: {
                not: id,
            },
            status: ACTIVE_STATUSES,
        },
    });
    const patientConflict = patientAppointments.some((appointment) => appointmentsOverlap(newStart, newDuration, appointment.appointmentAt, appointment.duration ?? 30));
    if (patientConflict) {
        throw new Error("Patient already has an overlapping appointment");
    }
    // -----------------------------------------
    // Update appointment
    // -----------------------------------------
    return prisma_1.prisma.appointment.update({
        where: { id },
        data: {
            ...data,
            ...(data.duration !== undefined
                ? { duration: newDuration }
                : {}),
        },
    });
};
exports.updateAppointment = updateAppointment;
const cancelAppointment = async (id) => {
    return prisma_1.prisma.appointment.update({
        where: { id },
        data: {
            status: "CANCELLED",
        },
    });
};
exports.cancelAppointment = cancelAppointment;
//# sourceMappingURL=appointment.service.js.map