import { prisma } from "../config/prisma";

export const getPatients = async () => {
  return prisma.patient.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const getPatientById = async (id: number) => {
  return prisma.patient.findUnique({
    where: { id }
  });
};

export const createPatient = async (data: {
  medicalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: "MALE" | "FEMALE" | "OTHER";
  email?: string;
  phone: string;
  address?: string;
  bloodGroup?: string;
}) => {
  return prisma.patient.create({
    data
  });
};

export const updatePatient = async (
  id: number,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    bloodGroup?: string;
    status?: "ACTIVE" | "INACTIVE" | "DECEASED";
  }
) => {
  return prisma.patient.update({
    where: { id },
    data
  });
};

export const deletePatient = async (id: number) => {
  return prisma.patient.delete({
    where: { id }
  });
};