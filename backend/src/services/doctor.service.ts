/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import crypto from "crypto";
import bcrypt from "bcryptjs";
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
  const normalizedEmail = data.email.toLowerCase().trim();

  /*
   * Admin-created doctors get a linked User account in INVITED state.
   *
   * A random temporary hash is stored because passwordHash is required
   * by the current User schema. The doctor cannot use this value to log in.
   * Step 3 will add the one-time password setup flow.
   */
  const temporaryPasswordHash = await bcrypt.hash(
    crypto.randomBytes(32).toString("hex"),
    10
  );

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: normalizedEmail,
        passwordHash: temporaryPasswordHash,
        role: "DOCTOR",
        status: "INVITED"
      }
    });

    return tx.doctor.create({
      data: {
        ...data,
        email: normalizedEmail,
        status: "INACTIVE"
      }
    });
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


export const getPendingDoctorRegistrationRequestCount = async () => {
  return prisma.doctorRegistrationRequest.count({
    where: {
      status: "PENDING"
    }
  });
};

export const getDoctorRegistrationRequests = async () => {
  return prisma.doctorRegistrationRequest.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          role: true
        }
      },
      reviewedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });
};

export const approveDoctorRegistrationRequest = async (
  requestId: number,
  adminUserId: number
) => {
  return prisma.$transaction(async (tx) => {
    const request =
      await tx.doctorRegistrationRequest.findUnique({
        where: {
          id: requestId
        }
      });

    if (!request) {
      throw new Error("DOCTOR_REGISTRATION_REQUEST_NOT_FOUND");
    }

    if (request.status !== "PENDING") {
      throw new Error("DOCTOR_REGISTRATION_REQUEST_ALREADY_REVIEWED");
    }

    const existingDoctor =
      await tx.doctor.findFirst({
        where: {
          OR: [
            { email: request.email },
            { licenseNumber: request.licenseNumber }
          ]
        },
        select: {
          id: true
        }
      });

    if (existingDoctor) {
      throw new Error("DOCTOR_ALREADY_EXISTS");
    }

    const existingDoctors =
      await tx.doctor.findMany({
        select: {
          doctorCode: true
        }
      });

    const maxCodeNumber =
      existingDoctors.reduce((max, doctor) => {
        const match =
          /^DOC-(\d+)$/.exec(doctor.doctorCode);

        if (!match) {
          return max;
        }

        return Math.max(
          max,
          Number(match[1])
        );
      }, 1000);

    const doctorCode =
      `DOC-${maxCodeNumber + 1}`;

    const doctor = await tx.doctor.create({
      data: {
        doctorCode,
        firstName: request.firstName,
        lastName: request.lastName,
        specialization: request.specialization,
        licenseNumber: request.licenseNumber,
        email: request.email,
        phone: request.phone,
        experience: request.experience,
        status: "ACTIVE"
      }
    });

    await tx.user.update({
      where: {
        id: request.userId
      },
      data: {
        status: "ACTIVE"
      }
    });

    await tx.doctorRegistrationRequest.update({
      where: {
        id: requestId
      },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedByUserId: adminUserId
      }
    });

    return doctor;
  });
};

export const rejectDoctorRegistrationRequest = async (
  requestId: number,
  adminUserId: number,
  rejectionReason?: string
) => {
  return prisma.$transaction(async (tx) => {
    const request =
      await tx.doctorRegistrationRequest.findUnique({
        where: {
          id: requestId
        }
      });

    if (!request) {
      throw new Error("DOCTOR_REGISTRATION_REQUEST_NOT_FOUND");
    }

    if (request.status !== "PENDING") {
      throw new Error("DOCTOR_REGISTRATION_REQUEST_ALREADY_REVIEWED");
    }

    return tx.doctorRegistrationRequest.update({
      where: {
        id: requestId
      },
      data: {
        status: "REJECTED",
        rejectionReason:
          rejectionReason || null,
        reviewedAt: new Date(),
        reviewedByUserId: adminUserId
      }
    });
  });
};