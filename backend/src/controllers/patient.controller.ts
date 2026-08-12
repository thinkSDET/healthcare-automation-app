import { Request, Response } from "express";

import type { AuthRequest } from "../middleware/auth";
import * as patientService from "../services/patient.service";

import * as patientDependentService from "../services/patient-dependent.service";

/*
|--------------------------------------------------------------------------
| Patients
|--------------------------------------------------------------------------
*/

export const getPatients = async (
  _req: Request,
  res: Response
) => {
  try {
    const patients =
      await patientService.getPatients();

    res.status(200).json({
      success: true,
      data: patients,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
    });
  }
};

export const getPatientById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient =
      await patientService.getPatientById(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient",
    });
  }
};

export const createPatient = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const patient =
      await patientService.createPatient(
        {
          ...req.body,
          dateOfBirth: new Date(
            req.body.dateOfBirth
          ),
        },
        {
          actorUserId: req.user.userId,
          actorRole: req.user.role,
        }
      );

    res.status(201).json({
      success: true,
      data: patient,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to create patient",
    });
  }
};

export const updatePatient = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = Number(req.params.id);

    const patient =
      await patientService.updatePatient(
        id,
        req.body,
        {
          actorUserId: req.user.userId,
          actorRole: req.user.role,
        }
      );

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to update patient",
    });
  }
};

export const deletePatient = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    await patientService.deletePatient(id);

    res.status(204).send();
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to delete patient",
    });
  }
};

export const deactivatePatient = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const patientId = Number(
      req.params.id
    );

    if (Number.isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient =
      await patientService.deactivatePatient(
        patientId,
        {
          actorUserId: req.user.userId,
          actorRole: req.user.role,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Patient deactivated successfully",
      data: patient,
    });
  } catch (error) {
    console.error(
      "DEACTIVATE PATIENT ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "PATIENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "PATIENT_ALREADY_INACTIVE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Patient is already inactive",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to deactivate patient",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Dependents
|--------------------------------------------------------------------------
*/

export const getPatientDependents = async (
  req: any,
  res: any
) => {
  try {
    const patientId = Number(
      req.params.id
    );

    if (Number.isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const dependents =
      await patientDependentService.getDependents(
        patientId
      );

    return res.status(200).json({
      success: true,
      data: dependents,
    });
  } catch (error) {
    console.error(
      "GET DEPENDENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dependents",
    });
  }
};

export const createPatientDependent = async (
  req: any,
  res: any
) => {
  try {
    const patientId = Number(
      req.params.id
    );

    if (Number.isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const {
      firstName,
      lastName,
      relationship,
      dateOfBirth,
      gender,
      phone,
      email,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !relationship
    ) {
      return res.status(400).json({
        success: false,
        message:
          "First name, last name and relationship are required",
      });
    }

    const dependent =
      await patientDependentService.createDependent(
        patientId,
        {
          firstName,
          lastName,
          relationship,
          dateOfBirth,
          gender,
          phone,
          email,
        }
      );

    return res.status(201).json({
      success: true,
      message:
        "Dependent added successfully",
      data: dependent,
    });
  } catch (error) {
    console.error(
      "CREATE DEPENDENT ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "PATIENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add dependent",
    });
  }
};

export const deletePatientDependent = async (
  req: any,
  res: any
) => {
  try {
    const dependentId = Number(
      req.params.dependentId
    );

    if (Number.isNaN(dependentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid dependent ID",
      });
    }

    const result =
      await patientDependentService.deleteDependent(
        dependentId
      );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(
      "DELETE DEPENDENT ERROR:",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "DEPENDENT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Dependent not found",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove dependent",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Emergency Contact
|--------------------------------------------------------------------------
*/

export const getPatientEmergencyContact =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const patientId = Number(
        req.params.id
      );

      if (Number.isNaN(patientId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid patient ID",
        });
      }

      const contact =
        await patientService.getPatientEmergencyContact(
          patientId
        );

      return res.status(200).json({
        success: true,
        data: contact,
      });
    } catch (error) {
      console.error(
        "GET EMERGENCY CONTACT ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "PATIENT_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch emergency contact",
      });
    }
  };

export const savePatientEmergencyContact =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const patientId = Number(
        req.params.id
      );

      if (Number.isNaN(patientId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid patient ID",
        });
      }

      const {
        firstName: requestFirstName,
        lastName: requestLastName,
        name,
        relationship,
        phone,
        alternatePhone,
        email,
        address,
      } = req.body;

      // The UI uses a single Full Name field, while the service expects
      // firstName and lastName. Accept both payload formats here.
      let firstName = requestFirstName?.trim();
      let lastName = requestLastName?.trim();

      if ((!firstName || !lastName) && name?.trim()) {
        const nameParts = name.trim().split(/\s+/).filter(Boolean);
        firstName = nameParts[0] || "";
        lastName = nameParts.slice(1).join(" ");
      }

      if (
        !firstName ||
        !lastName ||
        !relationship ||
        !phone
      ) {
        return res.status(400).json({
          success: false,
          message:
            "First name, last name, relationship and phone are required",
        });
      }

      const contact =
        await patientService.upsertPatientEmergencyContact(
          patientId,
          {
            firstName,
            lastName,
            relationship,
            phone,
            alternatePhone,
            email,
            address,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Emergency contact saved successfully",
        data: contact,
      });
    } catch (error) {
      console.error(
        "SAVE EMERGENCY CONTACT ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "PATIENT_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to save emergency contact",
      });
    }
  };

export const deletePatientEmergencyContact =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const patientId = Number(
        req.params.id
      );

      if (Number.isNaN(patientId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid patient ID",
        });
      }

      const result =
        await patientService.deletePatientEmergencyContact(
          patientId
        );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(
        "DELETE EMERGENCY CONTACT ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "EMERGENCY_CONTACT_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Emergency contact not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete emergency contact",
      });
    }
  };

  /*
|--------------------------------------------------------------------------
| Medical Profile
|--------------------------------------------------------------------------
*/

export const getPatientMedicalProfile =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const patientId =
        Number(req.params.id);

      if (Number.isNaN(patientId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid patient ID",
        });
      }

      const profile =
        await patientService.getPatientMedicalProfile(
          patientId
        );

      return res.status(200).json({
        success: true,
        data: profile,
      });

    } catch (error) {

      console.error(
        "GET MEDICAL PROFILE ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "PATIENT_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Patient not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch medical profile",
      });
    }
  };


export const savePatientMedicalProfile =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const patientId =
        Number(req.params.id);

      if (Number.isNaN(patientId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid patient ID",
        });
      }

      const {
        medicalConditions,
        allergies,
        currentMedications,
        medicalNotes,
      } = req.body;

      const profile =
        await patientService
          .upsertPatientMedicalProfile(
            patientId,
            {
              medicalConditions,
              allergies,
              currentMedications,
              medicalNotes,
            }
          );

      return res.status(200).json({
        success: true,
        message:
          "Medical profile saved successfully",
        data: profile,
      });

    } catch (error) {

      console.error(
        "SAVE MEDICAL PROFILE ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "PATIENT_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Patient not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to save medical profile",
      });
    }
  };

  /*
|--------------------------------------------------------------------------
| Patient Appointment History
|--------------------------------------------------------------------------
*/

export const getPatientAppointments =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const patientId =
        Number(req.params.id);

      if (Number.isNaN(patientId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid patient ID",
        });
      }

      const appointments =
        await patientService.getPatientAppointments(
          patientId
        );

      return res.status(200).json({
        success: true,
        data: appointments,
      });

    } catch (error) {

      console.error(
        "GET PATIENT APPOINTMENTS ERROR:",
        error
      );

      if (
        error instanceof Error &&
        error.message ===
          "PATIENT_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Patient not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch appointment history",
      });
    }
  };