/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { prisma } from "../config/prisma";
import * as appointmentService from "./appointment.service";
import {
  safeRecordAuditEvent,
  type AuditAction,
} from "./audit.service";

export type AppointmentRequestStatusValue =
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

const TERMINAL: AppointmentRequestStatusValue[] = [
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

const ACTIVE_APPOINTMENT_STATUSES = [
  "SCHEDULED",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_CONSULTATION",
] as const;

const getEndTime = (startTime: Date, duration: number) =>
  new Date(startTime.getTime() + duration * 60 * 1000);

const appointmentsOverlap = (
  startA: Date,
  durationA: number,
  startB: Date,
  durationB: number
) => {
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
} as const;

export const createAppointmentRequest = async (input: {
  doctorId: number;
  requestedAt: Date;
  duration?: number;
  type?: "IN_PERSON" | "VIDEO" | "PHONE";
  reason: string;
  notes?: string;
  requestedByUserId: number;
  role: string;
  ownPatientId: number | null;
}) => {
  const {
    doctorId,
    requestedAt,
    duration = 30,
    type = "IN_PERSON",
    reason,
    notes,
    requestedByUserId,
    role,
    ownPatientId,
  } = input;

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

  const patient = await prisma.patient.findUnique({
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

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
  });

  if (!doctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }

  if (doctor.status !== "ACTIVE") {
    throw new Error("DOCTOR_NOT_ACTIVE");
  }

  const duplicate = await prisma.appointmentRequest.findFirst({
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

  const doctorAppointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      status: { in: [...ACTIVE_APPOINTMENT_STATUSES] },
    },
  });

  const doctorConflict = doctorAppointments.some((appointment) =>
    appointmentsOverlap(
      requestedAt,
      duration,
      appointment.appointmentAt,
      appointment.duration ?? 30
    )
  );

  if (doctorConflict) {
    throw new Error("DOCTOR_OVERLAP");
  }

  const patientAppointments = await prisma.appointment.findMany({
    where: {
      patientId: ownPatientId,
      status: { in: [...ACTIVE_APPOINTMENT_STATUSES] },
    },
  });

  const patientConflict = patientAppointments.some((appointment) =>
    appointmentsOverlap(
      requestedAt,
      duration,
      appointment.appointmentAt,
      appointment.duration ?? 30
    )
  );

  if (patientConflict) {
    throw new Error("PATIENT_OVERLAP");
  }

  const requestNo = `AR-${Date.now()}`;

  const created = await prisma.appointmentRequest.create({
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

  await safeRecordAuditEvent({
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

export const listAppointmentRequests = async (filters: {
  role: string;
  ownPatientId: number | null;
  status?: AppointmentRequestStatusValue;
  doctorId?: number;
  patientId?: number;
}) => {
  const where: Record<string, unknown> = {};

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
  } else if (filters.patientId) {
    where.patientId = filters.patientId;
  }

  return prisma.appointmentRequest.findMany({
    where,
    include: detailInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getAppointmentRequestById = async (
  id: number,
  access: {
    role: string;
    ownPatientId: number | null;
  }
) => {
  const request = await prisma.appointmentRequest.findUnique({
    where: { id },
    include: detailInclude,
  });

  if (!request) {
    throw new Error("APPOINTMENT_REQUEST_NOT_FOUND");
  }

  if (access.role === "PATIENT") {
    if (
      !access.ownPatientId ||
      request.patientId !== access.ownPatientId
    ) {
      throw new Error("FORBIDDEN");
    }
  }

  return request;
};

export const updateAppointmentRequestStatus = async (input: {
  id: number;
  nextStatus: "APPROVED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string;
  actorUserId: number;
  role: string;
  ownPatientId: number | null;
}) => {
  const {
    id,
    nextStatus,
    rejectionReason,
    actorUserId,
    role,
    ownPatientId,
  } = input;

  const existing = await prisma.appointmentRequest.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: true,
    },
  });

  if (!existing) {
    throw new Error("APPOINTMENT_REQUEST_NOT_FOUND");
  }

  const current = existing.status as AppointmentRequestStatusValue;

  if (TERMINAL.includes(current) || current !== "SUBMITTED") {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  if (nextStatus === "CANCELLED") {
    const isAdmin = role === "ADMIN";
    const isOwnerPatient =
      role === "PATIENT" &&
      ownPatientId !== null &&
      existing.patientId === ownPatientId &&
      existing.requestedByUserId === actorUserId;

    if (!isAdmin && !isOwnerPatient) {
      throw new Error("FORBIDDEN");
    }
  } else {
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

    const claimed = await prisma.appointmentRequest.updateMany({
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
      const appointment = await appointmentService.createAppointment(
        {
          appointmentNo: `APT-${Date.now()}`,
          patientId: existing.patientId,
          doctorId: existing.doctorId,
          appointmentAt: existing.requestedAt,
          duration: existing.duration,
          type: existing.type as "IN_PERSON" | "VIDEO" | "PHONE",
          reason: existing.reason,
          notes: existing.notes || undefined,
        },
        {
          actorUserId,
          actorRole: role,
        }
      );

      await prisma.appointmentRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          appointmentId: appointment.id,
          reviewedByUserId: actorUserId,
          reviewedAt: new Date(),
          rejectionReason: null,
        },
      });
    } catch (error) {
      await prisma.appointmentRequest.update({
        where: { id },
        data: {
          reviewedByUserId: null,
          reviewedAt: null,
        },
      });
      throw error;
    }

    const approved = await prisma.appointmentRequest.findUniqueOrThrow({
      where: { id },
      include: detailInclude,
    });

    await safeRecordAuditEvent({
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

  const updated = await prisma.appointmentRequest.updateMany({
    where: {
      id,
      status: "SUBMITTED",
    },
    data: {
      status: nextStatus,
      rejectionReason:
        nextStatus === "REJECTED" ? rejectionReason!.trim() : null,
      reviewedByUserId:
        nextStatus === "CANCELLED" ? null : actorUserId,
      reviewedAt: nextStatus === "CANCELLED" ? null : new Date(),
    },
  });

  if (updated.count === 0) {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  const result = await prisma.appointmentRequest.findUniqueOrThrow({
    where: { id },
    include: detailInclude,
  });

  const action: AuditAction =
    nextStatus === "REJECTED"
      ? "REJECT"
      : nextStatus === "CANCELLED"
        ? "CANCEL"
        : "STATUS_CHANGE";

  await safeRecordAuditEvent({
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
