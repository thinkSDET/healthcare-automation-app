import { prisma } from "../config/prisma";

export const getPatients = async () => {
  return prisma.patient.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getPatientById = async (id: number) => {
  return prisma.patient.findUnique({
    where: { id },
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
    data,
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
    data,
  });
};

export const deletePatient = async (id: number) => {
  return prisma.patient.delete({
    where: { id },
  });
};

export const deactivatePatient = async (
  patientId: number
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

  if (patient.status === "INACTIVE") {
    throw new Error(
      "PATIENT_ALREADY_INACTIVE"
    );
  }

  return prisma.patient.update({
    where: {
      id: patientId,
    },
    data: {
      status: "INACTIVE",
    },
  });
};

/*
|--------------------------------------------------------------------------
| Emergency Contact
|--------------------------------------------------------------------------
*/

export const getPatientEmergencyContact = async (
  patientId: number
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

  return prisma.patientEmergencyContact.findUnique({
    where: {
      patientId,
    },
  });
};

export const upsertPatientEmergencyContact = async (
  patientId: number,
  data: {
    firstName: string;
    lastName: string;
    relationship: string;
    phone: string;
    alternatePhone?: string;
    email?: string;
    address?: string;
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

  return prisma.patientEmergencyContact.upsert({
    where: {
      patientId,
    },
    update: {
      firstName: data.firstName,
      lastName: data.lastName,
      relationship: data.relationship,
      phone: data.phone,
      alternatePhone:
        data.alternatePhone || null,
      email: data.email || null,
      address: data.address || null,
    },
    create: {
      patientId,
      firstName: data.firstName,
      lastName: data.lastName,
      relationship: data.relationship,
      phone: data.phone,
      alternatePhone:
        data.alternatePhone || null,
      email: data.email || null,
      address: data.address || null,
    },
  });
};

export const deletePatientEmergencyContact =
  async (patientId: number) => {
    const contact =
      await prisma.patientEmergencyContact.findUnique({
        where: {
          patientId,
        },
      });

    if (!contact) {
      throw new Error(
        "EMERGENCY_CONTACT_NOT_FOUND"
      );
    }

    await prisma.patientEmergencyContact.delete({
      where: {
        patientId,
      },
    });

    return {
      message:
        "Emergency contact deleted successfully",
    };
  };

  /*
|--------------------------------------------------------------------------
| Medical Profile
|--------------------------------------------------------------------------
*/

export const getPatientMedicalProfile = async (
  patientId: number
) => {
  const patient =
    await prisma.patient.findUnique({
      where: {
        id: patientId,
      },
    });

  if (!patient) {
    throw new Error(
      "PATIENT_NOT_FOUND"
    );
  }

  return prisma.patientMedicalProfile.findUnique({
    where: {
      patientId,
    },
  });
};

export const upsertPatientMedicalProfile =
  async (
    patientId: number,
    data: {
      medicalConditions?: string;
      allergies?: string;
      currentMedications?: string;
      medicalNotes?: string;
    }
  ) => {
    const patient =
      await prisma.patient.findUnique({
        where: {
          id: patientId,
        },
      });

    if (!patient) {
      throw new Error(
        "PATIENT_NOT_FOUND"
      );
    }

    return prisma.patientMedicalProfile.upsert({
      where: {
        patientId,
      },

      update: {
        medicalConditions:
          data.medicalConditions?.trim() ||
          null,

        allergies:
          data.allergies?.trim() ||
          null,

        currentMedications:
          data.currentMedications?.trim() ||
          null,

        medicalNotes:
          data.medicalNotes?.trim() ||
          null,
      },

      create: {
        patientId,

        medicalConditions:
          data.medicalConditions?.trim() ||
          null,

        allergies:
          data.allergies?.trim() ||
          null,

        currentMedications:
          data.currentMedications?.trim() ||
          null,

        medicalNotes:
          data.medicalNotes?.trim() ||
          null,
      },
    });
  };

  /*
|--------------------------------------------------------------------------
| Patient Appointment History
|--------------------------------------------------------------------------
*/

export const getPatientAppointments = async (
  patientId: number
) => {
  const patient =
    await prisma.patient.findUnique({
      where: {
        id: patientId,
      },
    });

  if (!patient) {
    throw new Error(
      "PATIENT_NOT_FOUND"
    );
  }

  return prisma.appointment.findMany({
    where: {
      patientId,
    },

    include: {
      doctor: {
        select: {
          id: true,
          doctorCode: true,
          firstName: true,
          lastName: true,
          specialization: true,
        },
      },
    },

    orderBy: {
      appointmentAt: "desc",
    },
  });
};