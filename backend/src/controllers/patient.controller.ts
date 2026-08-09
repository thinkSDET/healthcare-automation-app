import { Request, Response } from "express";
import * as patientService from "../services/patient.service";

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