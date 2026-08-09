import { prisma } from "../config/prisma";

export const getUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const getUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

export const createUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role?: "ADMIN" | "DOCTOR" | "PHARMACIST" | "SUPPORT" | "VIEWER";
}) => {
  return prisma.user.create({
    data
  });
};

export const updateUser = async (
  id: number,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: "ADMIN" | "DOCTOR" | "PHARMACIST" | "SUPPORT" | "VIEWER";
    status?: "ACTIVE" | "INACTIVE" | "LOCKED";
  }
) => {
  return prisma.user.update({
    where: { id },
    data
  });
};

export const deleteUser = async (id: number) => {
  return prisma.user.delete({
    where: { id }
  });
};