/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { prisma } from "../config/prisma";
import {
  safeRecordAuditEvent,
  type AuditContext,
} from "./audit.service";

export type AppointmentStatusValue =
  | "SCHEDULED"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "IN_CONSULTATION"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

const TERMINAL_STATUSES: AppointmentStatusValue[] = [
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

const ACTIVE_FOR_OVERLAP: AppointmentStatusValue[] = [
  "SCHEDULED",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_CONSULTATION",
];

const EDITABLE_STATUSES: AppointmentStatusValue[] = [
  "SCHEDULED",
  "CONFIRMED",
];

/** from → allowed next statuses */
const ALLOWED_TRANSITIONS: Record<
  AppointmentStatusValue,
  AppointmentStatusValue[]
> = {
  SCHEDULED: ["CONFIRMED", "CANCELLED", "NO_SHOW"],
  CONFIRMED: ["CHECKED_IN"],
  CHECKED_IN: ["IN_CONSULTATION"],
  IN_CONSULTATION: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

/** role → statuses that role may transition *to* */
const ROLE_TARGET_STATUSES: Record<
  string,
  AppointmentStatusValue[]
> = {
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

const getEndTime = (startTime: Date, duration: number) => {
  return new Date(startTime.getTime() + duration * 60 * 1000);
};

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

const isTerminal = (status: AppointmentStatusValue) =>
  TERMINAL_STATUSES.includes(status);

export const getAppointments = async () => {
  return prisma.appointment.findMany({
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: {
      appointmentAt: "asc",
    },
  });
};

export const getAppointmentById = async (id: number) => {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: true,
    },
  });
};

export const createAppointment = async (
  data: {
    appointmentNo: string;
    patientId: number;
    doctorId: number;
    appointmentAt: Date;
    duration?: number;
    type?: "IN_PERSON" | "VIDEO" | "PHONE";
    reason: string;
    notes?: string;
  },
  auditContext?: AuditContext
) => {
  const duration = data.duration ?? 30;

  if (duration <= 0) {
    throw new Error("Appointment duration must be greater than 0");
  }

  if (data.appointmentAt < new Date()) {
    throw new Error("Appointment cannot be scheduled in the past");
  }

  const patient = await prisma.patient.findUnique({
    where: { id: data.patientId },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: data.doctorId },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  if (doctor.status !== "ACTIVE") {
    throw new Error(
      "Doctor is not active and cannot receive appointments"
    );
  }

  const doctorAppointments = await prisma.appointment.findMany({
    where: {
      doctorId: data.doctorId,
      status: { in: ACTIVE_FOR_OVERLAP },
    },
  });

  const doctorConflict = doctorAppointments.some((appointment) =>
    appointmentsOverlap(
      data.appointmentAt,
      duration,
      appointment.appointmentAt,
      appointment.duration ?? 30
    )
  );

  if (doctorConflict) {
    throw new Error("Doctor already has an overlapping appointment");
  }

  const patientAppointments = await prisma.appointment.findMany({
    where: {
      patientId: data.patientId,
      status: { in: ACTIVE_FOR_OVERLAP },
    },
  });

  const patientConflict = patientAppointments.some((appointment) =>
    appointmentsOverlap(
      data.appointmentAt,
      duration,
      appointment.appointmentAt,
      appointment.duration ?? 30
    )
  );

  if (patientConflict) {
    throw new Error("Patient already has an overlapping appointment");
  }

  const created = await prisma.appointment.create({
    data: {
      ...data,
      duration,
    },
    include: {
      patient: true,
      doctor: true,
    },
  });

  if (auditContext) {
    await safeRecordAuditEvent({
      actorUserId: auditContext.actorUserId,
      actorRole: auditContext.actorRole,
      action: "CREATE",
      entityType: "APPOINTMENT",
      entityId: created.id,
      metadata: {
        appointmentNo: created.appointmentNo,
        patientId: created.patientId,
        doctorId: created.doctorId,
      },
    });
  }

  return created;
};

export const updateAppointment = async (
  id: number,
  data: {
    appointmentAt?: Date;
    duration?: number;
    type?: "IN_PERSON" | "VIDEO" | "PHONE";
    reason?: string;
    notes?: string;
  },
  auditContext?: AuditContext
) => {
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!existingAppointment) {
    throw new Error("Appointment not found");
  }

  const currentStatus =
    existingAppointment.status as AppointmentStatusValue;

  if (isTerminal(currentStatus)) {
    throw new Error("Cannot modify a terminal appointment");
  }

  if (!EDITABLE_STATUSES.includes(currentStatus)) {
    throw new Error(
      "Appointment schedule can only be edited when SCHEDULED or CONFIRMED"
    );
  }

  const newStart =
    data.appointmentAt ?? existingAppointment.appointmentAt;

  const newDuration =
    data.duration ?? existingAppointment.duration ?? 30;

  if (newDuration <= 0) {
    throw new Error("Appointment duration must be greater than 0");
  }

  if (newStart < new Date()) {
    throw new Error("Appointment cannot be scheduled in the past");
  }

  const doctorAppointments = await prisma.appointment.findMany({
    where: {
      doctorId: existingAppointment.doctorId,
      id: { not: id },
      status: { in: ACTIVE_FOR_OVERLAP },
    },
  });

  const doctorConflict = doctorAppointments.some((appointment) =>
    appointmentsOverlap(
      newStart,
      newDuration,
      appointment.appointmentAt,
      appointment.duration ?? 30
    )
  );

  if (doctorConflict) {
    throw new Error("Doctor already has an overlapping appointment");
  }

  const patientAppointments = await prisma.appointment.findMany({
    where: {
      patientId: existingAppointment.patientId,
      id: { not: id },
      status: { in: ACTIVE_FOR_OVERLAP },
    },
  });

  const patientConflict = patientAppointments.some((appointment) =>
    appointmentsOverlap(
      newStart,
      newDuration,
      appointment.appointmentAt,
      appointment.duration ?? 30
    )
  );

  if (patientConflict) {
    throw new Error("Patient already has an overlapping appointment");
  }

  const updated = await prisma.appointment.update({
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

  if (auditContext) {
    await safeRecordAuditEvent({
      actorUserId: auditContext.actorUserId,
      actorRole: auditContext.actorRole,
      action: "UPDATE",
      entityType: "APPOINTMENT",
      entityId: updated.id,
      metadata: {
        appointmentNo: updated.appointmentNo,
      },
    });
  }

  return updated;
};

export const updateAppointmentStatus = async (
  id: number,
  nextStatus: AppointmentStatusValue,
  role: string,
  auditContext?: AuditContext
) => {
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!existingAppointment) {
    throw new Error("Appointment not found");
  }

  const currentStatus =
    existingAppointment.status as AppointmentStatusValue;

  if (isTerminal(currentStatus)) {
    throw new Error("Cannot modify a terminal appointment");
  }

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] ?? [];

  if (!allowedNext.includes(nextStatus)) {
    throw new Error("Invalid appointment status transition");
  }

  const roleTargets = ROLE_TARGET_STATUSES[role] ?? [];

  if (!roleTargets.includes(nextStatus)) {
    throw new Error(
      "You do not have permission to perform this appointment status change"
    );
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: nextStatus },
    include: {
      patient: true,
      doctor: true,
    },
  });

  await safeRecordAuditEvent({
    actorUserId: auditContext?.actorUserId,
    actorRole: auditContext?.actorRole ?? role,
    action: nextStatus === "CANCELLED" ? "CANCEL" : "STATUS_CHANGE",
    entityType: "APPOINTMENT",
    entityId: updated.id,
    metadata: {
      appointmentNo: updated.appointmentNo,
      from: currentStatus,
      to: nextStatus,
    },
  });

  return updated;
};

export const cancelAppointment = async (
  id: number,
  auditContext?: AuditContext
) => {
  const existingAppointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!existingAppointment) {
    throw new Error("Appointment not found");
  }

  if (existingAppointment.status !== "SCHEDULED") {
    throw new Error("Only scheduled appointments can be cancelled");
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      status: "CANCELLED",
    },
    include: {
      patient: true,
      doctor: true,
    },
  });

  if (auditContext) {
    await safeRecordAuditEvent({
      actorUserId: auditContext.actorUserId,
      actorRole: auditContext.actorRole,
      action: "CANCEL",
      entityType: "APPOINTMENT",
      entityId: updated.id,
      metadata: {
        appointmentNo: updated.appointmentNo,
        from: "SCHEDULED",
        to: "CANCELLED",
      },
    });
  }

  return updated;
};
