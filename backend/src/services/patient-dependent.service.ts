/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { prisma } from "../config/prisma";

export const getDependents = async (
  patientId: number
) => {
  return prisma.patientDependent.findMany({
    where: {
      patientId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createDependent = async (
  patientId: number,
  data: {
    firstName: string;
    lastName: string;
    relationship: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    email?: string;
  }
) => {
  const patient =
    await prisma.patient.findUnique({
      where: {
        id: patientId,
      },
    });

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  return prisma.patientDependent.create({
    data: {
      patientId,
      firstName: data.firstName,
      lastName: data.lastName,
      relationship: data.relationship,
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : undefined,
      gender: data.gender
        ? (data.gender as any)
        : undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
    },
  });
};

export const deleteDependent = async (
  dependentId: number
) => {
  const dependent =
    await prisma.patientDependent.findUnique({
      where: {
        id: dependentId,
      },
    });

  if (!dependent) {
    throw new Error("DEPENDENT_NOT_FOUND");
  }

  await prisma.patientDependent.delete({
    where: {
      id: dependentId,
    },
  });

  return {
    message: "Dependent removed successfully",
  };
};