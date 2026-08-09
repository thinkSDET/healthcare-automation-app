import { prisma } from "../config/prisma";

export const getAppointments = async () => {
  return prisma.appointment.findMany({
    include: {
      patient: true,
      doctor: true
    },
    orderBy: {
      appointmentAt: "asc"
    }
  });
};

export const getAppointmentById = async (id: number) => {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: true
    }
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
  const existing = await prisma.appointment.findFirst({
    where: {
      doctorId: data.doctorId,
      appointmentAt: data.appointmentAt,
      status: {
        notIn: ["CANCELLED", "NO_SHOW"]
      }
    }
  });

  if (existing) {
    throw new Error("Doctor already has an appointment at this time");
  }

  return prisma.appointment.create({
    data
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
  return prisma.appointment.update({
    where: { id },
    data
  });
};

export const cancelAppointment = async (id: number) => {
  return prisma.appointment.update({
    where: { id },
    data: {
      status: "CANCELLED"
    }
  });
};