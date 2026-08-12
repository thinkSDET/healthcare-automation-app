import { prisma } from "../config/prisma";

export const getDoctors = async (options?: {
  activeOnly?: boolean;
}) => {
  return prisma.doctor.findMany({
    where: options?.activeOnly
      ? { status: "ACTIVE" }
      : undefined,
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const getDoctorById = async (id: number) => {
  return prisma.doctor.findUnique({
    where: { id }
  });
};

export const createDoctor = async (data: {
  doctorCode: string;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  email: string;
  phone: string;
  experience: number;
}) => {
  return prisma.doctor.create({
    data
  });
};

export const updateDoctor = async (
  id: number,
  data: {
    firstName?: string;
    lastName?: string;
    specialization?: string;
    phone?: string;
    experience?: number;
    status?: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
  }
) => {
  return prisma.doctor.update({
    where: { id },
    data
  });
};

export const deleteDoctor = async (id: number) => {
  return prisma.doctor.delete({
    where: { id }
  });
};