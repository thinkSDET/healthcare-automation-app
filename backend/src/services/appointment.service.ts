import { prisma } from "../config/prisma";

const ACTIVE_STATUSES = {
  notIn: ["CANCELLED", "NO_SHOW"] as const,
};

const getEndTime = (
  startTime: Date,
  duration: number
) => {
  return new Date(
    startTime.getTime() + duration * 60 * 1000
  );
};

const appointmentsOverlap = (
  startA: Date,
  durationA: number,
  startB: Date,
  durationB: number
) => {
  const endA = getEndTime(startA, durationA);
  const endB = getEndTime(startB, durationB);

  return (
    startA < endB &&
    endA > startB
  );
};

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

export const getAppointmentById = async (
  id: number
) => {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: true,
    },
  });
};

export const createAppointment = async (data: {
  appointmentNo: string;
  patientId: number;
  doctorId: number;
  appointmentAt: Date;
  duration?: number;
  type?: "IN_PERSON" | "VIDEO" | "PHONE";
  reason: string;
  notes?: string;
}) => {
  const duration = data.duration ?? 30;

  // -----------------------------------------
  // Basic validation
  // -----------------------------------------

  if (duration <= 0) {
    throw new Error(
      "Appointment duration must be greater than 0"
    );
  }

  if (data.appointmentAt < new Date()) {
    throw new Error(
      "Appointment cannot be scheduled in the past"
    );
  }

  // -----------------------------------------
  // Get active appointments for doctor
  // -----------------------------------------

  const doctorAppointments =
    await prisma.appointment.findMany({
      where: {
        doctorId: data.doctorId,
        status: ACTIVE_STATUSES,
      },
    });

  // -----------------------------------------
  // Doctor conflict check
  // -----------------------------------------

  const doctorConflict =
    doctorAppointments.some((appointment) =>
      appointmentsOverlap(
        data.appointmentAt,
        duration,
        appointment.appointmentAt,
        appointment.duration ?? 30
      )
    );

  if (doctorConflict) {
    throw new Error(
      "Doctor already has an overlapping appointment"
    );
  }

  // -----------------------------------------
  // Get active appointments for patient
  // -----------------------------------------

  const patientAppointments =
    await prisma.appointment.findMany({
      where: {
        patientId: data.patientId,
        status: ACTIVE_STATUSES,
      },
    });

  // -----------------------------------------
  // Patient conflict check
  // -----------------------------------------

  const patientConflict =
    patientAppointments.some((appointment) =>
      appointmentsOverlap(
        data.appointmentAt,
        duration,
        appointment.appointmentAt,
        appointment.duration ?? 30
      )
    );

  if (patientConflict) {
    throw new Error(
      "Patient already has an overlapping appointment"
    );
  }

  // -----------------------------------------
  // Create appointment
  // -----------------------------------------

  return prisma.appointment.create({
    data: {
      ...data,
      duration,
    },
  });
};

export const updateAppointment = async (
  id: number,
  data: {
    appointmentAt?: Date;
    duration?: number;
    type?: "IN_PERSON" | "VIDEO" | "PHONE";
    status?:
      | "SCHEDULED"
      | "CONFIRMED"
      | "COMPLETED"
      | "CANCELLED"
      | "NO_SHOW";
    reason?: string;
    notes?: string;
  }
) => {
  // -----------------------------------------
  // Get existing appointment
  // -----------------------------------------

  const existingAppointment =
    await prisma.appointment.findUnique({
      where: { id },
    });

  if (!existingAppointment) {
    throw new Error(
      "Appointment not found"
    );
  }

  // -----------------------------------------
  // If appointment is being cancelled/no-show,
  // no conflict validation is required.
  // -----------------------------------------

  if (
    data.status === "CANCELLED" ||
    data.status === "NO_SHOW"
  ) {
    return prisma.appointment.update({
      where: { id },
      data,
    });
  }

  const newStart =
    data.appointmentAt ??
    existingAppointment.appointmentAt;

  const newDuration =
    data.duration ??
    existingAppointment.duration ??
    30;

  // -----------------------------------------
  // Basic validation
  // -----------------------------------------

  if (newDuration <= 0) {
    throw new Error(
      "Appointment duration must be greater than 0"
    );
  }

  if (newStart < new Date()) {
    throw new Error(
      "Appointment cannot be scheduled in the past"
    );
  }

  // -----------------------------------------
  // Check doctor conflicts
  // -----------------------------------------

  const doctorAppointments =
    await prisma.appointment.findMany({
      where: {
        doctorId:
          existingAppointment.doctorId,

        id: {
          not: id,
        },

        status: ACTIVE_STATUSES,
      },
    });

  const doctorConflict =
    doctorAppointments.some((appointment) =>
      appointmentsOverlap(
        newStart,
        newDuration,
        appointment.appointmentAt,
        appointment.duration ?? 30
      )
    );

  if (doctorConflict) {
    throw new Error(
      "Doctor already has an overlapping appointment"
    );
  }

  // -----------------------------------------
  // Check patient conflicts
  // -----------------------------------------

  const patientAppointments =
    await prisma.appointment.findMany({
      where: {
        patientId:
          existingAppointment.patientId,

        id: {
          not: id,
        },

        status: ACTIVE_STATUSES,
      },
    });

  const patientConflict =
    patientAppointments.some((appointment) =>
      appointmentsOverlap(
        newStart,
        newDuration,
        appointment.appointmentAt,
        appointment.duration ?? 30
      )
    );

  if (patientConflict) {
    throw new Error(
      "Patient already has an overlapping appointment"
    );
  }

  // -----------------------------------------
  // Update appointment
  // -----------------------------------------

  return prisma.appointment.update({
    where: { id },
    data: {
      ...data,
      ...(data.duration !== undefined
        ? { duration: newDuration }
        : {}),
    },
  });
};

export const cancelAppointment = async (
  id: number
) => {
  return prisma.appointment.update({
    where: { id },
    data: {
      status: "CANCELLED",
    },
  });
};