"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentRequestStatus = exports.getAppointmentRequestById = exports.listAppointmentRequests = exports.createAppointmentRequest = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const prisma_1 = require("../config/prisma");
const appointmentService = __importStar(require("./appointment.service"));
const audit_service_1 = require("./audit.service");
const TERMINAL = [
    "APPROVED",
    "REJECTED",
    "CANCELLED",
];
const ACTIVE_APPOINTMENT_STATUSES = [
    "SCHEDULED",
    "CONFIRMED",
    "CHECKED_IN",
    "IN_CONSULTATION",
];
const getEndTime = (startTime, duration) => new Date(startTime.getTime() + duration * 60 * 1000);
const appointmentsOverlap = (startA, durationA, startB, durationB) => {
    const endA = getEndTime(startA, durationA);
    const endB = getEndTime(startB, durationB);
    return startA < endB && endA > startB;
};
const detailInclude = {
    patient: {
        select: {
            id: true,
            medicalId: true,
            firstName: true,
            lastName: true,
            status: true,
            userId: true,
        },
    },
    doctor: {
        select: {
            id: true,
            doctorCode: true,
            firstName: true,
            lastName: true,
            specialization: true,
            status: true,
        },
    },
    appointment: {
        select: {
            id: true,
            appointmentNo: true,
            appointmentAt: true,
            status: true,
            duration: true,
        },
    },
    requestedBy: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
        },
    },
    reviewedBy: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
        },
    },
};
const createAppointmentRequest = async (input) => {
    const { doctorId, requestedAt, duration = 30, type = "IN_PERSON", reason, notes, requestedByUserId, role, ownPatientId, } = input;
    if (role !== "PATIENT") {
        throw new Error("FORBIDDEN");
    }
    if (!ownPatientId) {
        throw new Error("NO_PATIENT_LINK");
    }
    if (duration <= 0) {
        throw new Error("INVALID_DURATION");
    }
    if (requestedAt < new Date()) {
        throw new Error("REQUEST_IN_PAST");
    }
    const patient = await prisma_1.prisma.patient.findUnique({
        where: { id: ownPatientId },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    if (patient.status !== "ACTIVE") {
        throw new Error("PATIENT_NOT_ACTIVE");
    }
    if (patient.userId !== requestedByUserId) {
        throw new Error("FORBIDDEN");
    }
    const doctor = await prisma_1.prisma.doctor.findUnique({
        where: { id: doctorId },
    });
    if (!doctor) {
        throw new Error("DOCTOR_NOT_FOUND");
    }
    if (doctor.status !== "ACTIVE") {
        throw new Error("DOCTOR_NOT_ACTIVE");
    }
    const duplicate = await prisma_1.prisma.appointmentRequest.findFirst({
        where: {
            patientId: ownPatientId,
            doctorId,
            requestedAt,
            status: "SUBMITTED",
        },
    });
    if (duplicate) {
        throw new Error("DUPLICATE_SUBMITTED_REQUEST");
    }
    const doctorAppointments = await prisma_1.prisma.appointment.findMany({
        where: {
            doctorId,
            status: { in: [...ACTIVE_APPOINTMENT_STATUSES] },
        },
    });
    const doctorConflict = doctorAppointments.some((appointment) => appointmentsOverlap(requestedAt, duration, appointment.appointmentAt, appointment.duration ?? 30));
    if (doctorConflict) {
        throw new Error("DOCTOR_OVERLAP");
    }
    const patientAppointments = await prisma_1.prisma.appointment.findMany({
        where: {
            patientId: ownPatientId,
            status: { in: [...ACTIVE_APPOINTMENT_STATUSES] },
        },
    });
    const patientConflict = patientAppointments.some((appointment) => appointmentsOverlap(requestedAt, duration, appointment.appointmentAt, appointment.duration ?? 30));
    if (patientConflict) {
        throw new Error("PATIENT_OVERLAP");
    }
    const requestNo = `AR-${Date.now()}`;
    const created = await prisma_1.prisma.appointmentRequest.create({
        data: {
            requestNo,
            patientId: ownPatientId,
            doctorId,
            requestedAt,
            duration,
            type,
            reason: reason.trim(),
            notes: notes?.trim() || null,
            status: "SUBMITTED",
            requestedByUserId,
        },
        include: detailInclude,
    });
    await (0, audit_service_1.safeRecordAuditEvent)({
        actorUserId: requestedByUserId,
        actorRole: role,
        action: "CREATE",
        entityType: "APPOINTMENT_REQUEST",
        entityId: created.id,
        metadata: {
            requestNo: created.requestNo,
            patientId: created.patientId,
            doctorId: created.doctorId,
        },
    });
    return created;
};
exports.createAppointmentRequest = createAppointmentRequest;
const listAppointmentRequests = async (filters) => {
    const where = {};
    if (filters.status) {
        where.status = filters.status;
    }
    if (filters.doctorId) {
        where.doctorId = filters.doctorId;
    }
    if (filters.role === "PATIENT") {
        if (!filters.ownPatientId) {
            throw new Error("NO_PATIENT_LINK");
        }
        where.patientId = filters.ownPatientId;
    }
    else if (filters.patientId) {
        where.patientId = filters.patientId;
    }
    return prisma_1.prisma.appointmentRequest.findMany({
        where,
        include: detailInclude,
        orderBy: { createdAt: "desc" },
    });
};
exports.listAppointmentRequests = listAppointmentRequests;
const getAppointmentRequestById = async (id, access) => {
    const request = await prisma_1.prisma.appointmentRequest.findUnique({
        where: { id },
        include: detailInclude,
    });
    if (!request) {
        throw new Error("APPOINTMENT_REQUEST_NOT_FOUND");
    }
    if (access.role === "PATIENT") {
        if (!access.ownPatientId ||
            request.patientId !== access.ownPatientId) {
            throw new Error("FORBIDDEN");
        }
    }
    return request;
};
exports.getAppointmentRequestById = getAppointmentRequestById;
const updateAppointmentRequestStatus = async (input) => {
    const { id, nextStatus, rejectionReason, actorUserId, role, ownPatientId, } = input;
    const existing = await prisma_1.prisma.appointmentRequest.findUnique({
        where: { id },
        include: {
            patient: true,
            doctor: true,
        },
    });
    if (!existing) {
        throw new Error("APPOINTMENT_REQUEST_NOT_FOUND");
    }
    const current = existing.status;
    if (TERMINAL.includes(current) || current !== "SUBMITTED") {
        throw new Error("INVALID_STATUS_TRANSITION");
    }
    if (nextStatus === "CANCELLED") {
        const isAdmin = role === "ADMIN";
        const isOwnerPatient = role === "PATIENT" &&
            ownPatientId !== null &&
            existing.patientId === ownPatientId &&
            existing.requestedByUserId === actorUserId;
        if (!isAdmin && !isOwnerPatient) {
            throw new Error("FORBIDDEN");
        }
    }
    else {
        if (role !== "ADMIN" && role !== "DOCTOR") {
            throw new Error("FORBIDDEN");
        }
    }
    if (nextStatus === "REJECTED" && !rejectionReason?.trim()) {
        throw new Error("REJECTION_REASON_REQUIRED");
    }
    if (nextStatus === "APPROVED") {
        if (existing.patient.status !== "ACTIVE") {
            throw new Error("PATIENT_NOT_ACTIVE");
        }
        if (existing.doctor.status !== "ACTIVE") {
            throw new Error("DOCTOR_NOT_ACTIVE");
        }
        const claimed = await prisma_1.prisma.appointmentRequest.updateMany({
            where: {
                id,
                status: "SUBMITTED",
                appointmentId: null,
            },
            data: {
                reviewedByUserId: actorUserId,
                reviewedAt: new Date(),
            },
        });
        if (claimed.count === 0) {
            throw new Error("INVALID_STATUS_TRANSITION");
        }
        try {
            const appointment = await appointmentService.createAppointment({
                appointmentNo: `APT-${Date.now()}`,
                patientId: existing.patientId,
                doctorId: existing.doctorId,
                appointmentAt: existing.requestedAt,
                duration: existing.duration,
                type: existing.type,
                reason: existing.reason,
                notes: existing.notes || undefined,
            }, {
                actorUserId,
                actorRole: role,
            });
            await prisma_1.prisma.appointmentRequest.update({
                where: { id },
                data: {
                    status: "APPROVED",
                    appointmentId: appointment.id,
                    reviewedByUserId: actorUserId,
                    reviewedAt: new Date(),
                    rejectionReason: null,
                },
            });
        }
        catch (error) {
            await prisma_1.prisma.appointmentRequest.update({
                where: { id },
                data: {
                    reviewedByUserId: null,
                    reviewedAt: null,
                },
            });
            throw error;
        }
        const approved = await prisma_1.prisma.appointmentRequest.findUniqueOrThrow({
            where: { id },
            include: detailInclude,
        });
        await (0, audit_service_1.safeRecordAuditEvent)({
            actorUserId,
            actorRole: role,
            action: "APPROVE",
            entityType: "APPOINTMENT_REQUEST",
            entityId: approved.id,
            metadata: {
                requestNo: approved.requestNo,
                appointmentId: approved.appointmentId,
            },
        });
        return approved;
    }
    const updated = await prisma_1.prisma.appointmentRequest.updateMany({
        where: {
            id,
            status: "SUBMITTED",
        },
        data: {
            status: nextStatus,
            rejectionReason: nextStatus === "REJECTED" ? rejectionReason.trim() : null,
            reviewedByUserId: nextStatus === "CANCELLED" ? null : actorUserId,
            reviewedAt: nextStatus === "CANCELLED" ? null : new Date(),
        },
    });
    if (updated.count === 0) {
        throw new Error("INVALID_STATUS_TRANSITION");
    }
    const result = await prisma_1.prisma.appointmentRequest.findUniqueOrThrow({
        where: { id },
        include: detailInclude,
    });
    const action = nextStatus === "REJECTED"
        ? "REJECT"
        : nextStatus === "CANCELLED"
            ? "CANCEL"
            : "STATUS_CHANGE";
    await (0, audit_service_1.safeRecordAuditEvent)({
        actorUserId,
        actorRole: role,
        action,
        entityType: "APPOINTMENT_REQUEST",
        entityId: result.id,
        metadata: {
            requestNo: result.requestNo,
            from: "SUBMITTED",
            to: nextStatus,
        },
    });
    return result;
};
exports.updateAppointmentRequestStatus = updateAppointmentRequestStatus;
//# sourceMappingURL=appointment-request.service.js.map