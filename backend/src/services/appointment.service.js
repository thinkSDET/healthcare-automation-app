"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelAppointment = exports.updateAppointmentStatus = exports.updateAppointment = exports.createAppointment = exports.getAppointmentById = exports.getAppointments = void 0;
const prisma_1 = require("../config/prisma");
const TERMINAL_STATUSES = [
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
];
const ACTIVE_FOR_OVERLAP = [
    "SCHEDULED",
    "CONFIRMED",
    "CHECKED_IN",
    "IN_CONSULTATION",
];
const EDITABLE_STATUSES = [
    "SCHEDULED",
    "CONFIRMED",
];
/** from → allowed next statuses */
const ALLOWED_TRANSITIONS = {
    SCHEDULED: ["CONFIRMED", "CANCELLED", "NO_SHOW"],
    CONFIRMED: ["CHECKED_IN"],
    CHECKED_IN: ["IN_CONSULTATION"],
    IN_CONSULTATION: ["COMPLETED"],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: [],
};
/** role → statuses that role may transition *to* */
const ROLE_TARGET_STATUSES = {
    ADMIN: [
        "CONFIRMED",
        "CHECKED_IN",
        "IN_CONSULTATION",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
    ],
    DOCTOR: [
        "CONFIRMED",
        "CHECKED_IN",
        "IN_CONSULTATION",
        "COMPLETED",
        "NO_SHOW",
    ],
};
const getEndTime = (startTime, duration) => {
    return new Date(startTime.getTime() + duration * 60 * 1000);
};
const appointmentsOverlap = (startA, durationA, startB, durationB) => {
    const endA = getEndTime(startA, durationA);
    const endB = getEndTime(startB, durationB);
    return startA < endB && endA > startB;
};
const isTerminal = (status) => TERMINAL_STATUSES.includes(status);
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
    if (duration <= 0) {
        throw new Error("Appointment duration must be greater than 0");
    }
    if (data.appointmentAt < new Date()) {
        throw new Error("Appointment cannot be scheduled in the past");
    }
    const patient = await prisma_1.prisma.patient.findUnique({
        where: { id: data.patientId },
    });
    if (!patient) {
        throw new Error("Patient not found");
    }
    const doctor = await prisma_1.prisma.doctor.findUnique({
        where: { id: data.doctorId },
    });
    if (!doctor) {
        throw new Error("Doctor not found");
    }
    if (doctor.status !== "ACTIVE") {
        throw new Error("Doctor is not active and cannot receive appointments");
    }
    const doctorAppointments = await prisma_1.prisma.appointment.findMany({
        where: {
            doctorId: data.doctorId,
            status: { in: ACTIVE_FOR_OVERLAP },
        },
    });
    const doctorConflict = doctorAppointments.some((appointment) => appointmentsOverlap(data.appointmentAt, duration, appointment.appointmentAt, appointment.duration ?? 30));
    if (doctorConflict) {
        throw new Error("Doctor already has an overlapping appointment");
    }
    const patientAppointments = await prisma_1.prisma.appointment.findMany({
        where: {
            patientId: data.patientId,
            status: { in: ACTIVE_FOR_OVERLAP },
        },
    });
    const patientConflict = patientAppointments.some((appointment) => appointmentsOverlap(data.appointmentAt, duration, appointment.appointmentAt, appointment.duration ?? 30));
    if (patientConflict) {
        throw new Error("Patient already has an overlapping appointment");
    }
    return prisma_1.prisma.appointment.create({
        data: {
            ...data,
            duration,
        },
        include: {
            patient: true,
            doctor: true,
        },
    });
};
exports.createAppointment = createAppointment;
const updateAppointment = async (id, data) => {
    const existingAppointment = await prisma_1.prisma.appointment.findUnique({
        where: { id },
    });
    if (!existingAppointment) {
        throw new Error("Appointment not found");
    }
    const currentStatus = existingAppointment.status;
    if (isTerminal(currentStatus)) {
        throw new Error("Cannot modify a terminal appointment");
    }
    if (!EDITABLE_STATUSES.includes(currentStatus)) {
        throw new Error("Appointment schedule can only be edited when SCHEDULED or CONFIRMED");
    }
    const newStart = data.appointmentAt ?? existingAppointment.appointmentAt;
    const newDuration = data.duration ?? existingAppointment.duration ?? 30;
    if (newDuration <= 0) {
        throw new Error("Appointment duration must be greater than 0");
    }
    if (newStart < new Date()) {
        throw new Error("Appointment cannot be scheduled in the past");
    }
    const doctorAppointments = await prisma_1.prisma.appointment.findMany({
        where: {
            doctorId: existingAppointment.doctorId,
            id: { not: id },
            status: { in: ACTIVE_FOR_OVERLAP },
        },
    });
    const doctorConflict = doctorAppointments.some((appointment) => appointmentsOverlap(newStart, newDuration, appointment.appointmentAt, appointment.duration ?? 30));
    if (doctorConflict) {
        throw new Error("Doctor already has an overlapping appointment");
    }
    const patientAppointments = await prisma_1.prisma.appointment.findMany({
        where: {
            patientId: existingAppointment.patientId,
            id: { not: id },
            status: { in: ACTIVE_FOR_OVERLAP },
        },
    });
    const patientConflict = patientAppointments.some((appointment) => appointmentsOverlap(newStart, newDuration, appointment.appointmentAt, appointment.duration ?? 30));
    if (patientConflict) {
        throw new Error("Patient already has an overlapping appointment");
    }
    return prisma_1.prisma.appointment.update({
        where: { id },
        data: {
            ...data,
            ...(data.duration !== undefined ? { duration: newDuration } : {}),
        },
        include: {
            patient: true,
            doctor: true,
        },
    });
};
exports.updateAppointment = updateAppointment;
const updateAppointmentStatus = async (id, nextStatus, role) => {
    const existingAppointment = await prisma_1.prisma.appointment.findUnique({
        where: { id },
    });
    if (!existingAppointment) {
        throw new Error("Appointment not found");
    }
    const currentStatus = existingAppointment.status;
    if (isTerminal(currentStatus)) {
        throw new Error("Cannot modify a terminal appointment");
    }
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] ?? [];
    if (!allowedNext.includes(nextStatus)) {
        throw new Error("Invalid appointment status transition");
    }
    const roleTargets = ROLE_TARGET_STATUSES[role] ?? [];
    if (!roleTargets.includes(nextStatus)) {
        throw new Error("You do not have permission to perform this appointment status change");
    }
    return prisma_1.prisma.appointment.update({
        where: { id },
        data: { status: nextStatus },
        include: {
            patient: true,
            doctor: true,
        },
    });
};
exports.updateAppointmentStatus = updateAppointmentStatus;
const cancelAppointment = async (id) => {
    const existingAppointment = await prisma_1.prisma.appointment.findUnique({
        where: { id },
    });
    if (!existingAppointment) {
        throw new Error("Appointment not found");
    }
    if (existingAppointment.status !== "SCHEDULED") {
        throw new Error("Only scheduled appointments can be cancelled");
    }
    return prisma_1.prisma.appointment.update({
        where: { id },
        data: {
            status: "CANCELLED",
        },
        include: {
            patient: true,
            doctor: true,
        },
    });
};
exports.cancelAppointment = cancelAppointment;
//# sourceMappingURL=appointment.service.js.map