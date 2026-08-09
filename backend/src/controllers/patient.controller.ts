import { Request, Response } from "express";
import * as patientService from "../services/patient.service";
import * as patientDependentService from "../services/patient-dependent.service";

export const getPatients = async (_req: Request, res: Response) => {
  try {
    const patients = await patientService.getPatients();

    res.status(200).json({
      success: true,
      data: patients
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients"
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
        message: "Invalid patient ID"
      });
    }

    const patient = await patientService.getPatientById(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient"
    });
  }
};

export const createPatient = async (
  req: Request,
  res: Response
) => {
  try {
    const patient = await patientService.createPatient({
      ...req.body,
      dateOfBirth: new Date(req.body.dateOfBirth)
    });

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to create patient"
    });
  }
};

export const updatePatient = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const patient = await patientService.updatePatient(
      id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to update patient"
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
      message: "Failed to delete patient"
    });
  }
};

export const deactivatePatient = async (
  req: any,
  res: any
) => {
  try {
    const patientId = Number(req.params.id);

    if (Number.isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient =
      await patientService.deactivatePatient(
        patientId
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

export const getPatientDependents = async (
  req: any,
  res: any
) => {
  try {
    const patientId = Number(req.params.id);

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
    const patientId = Number(req.params.id);

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