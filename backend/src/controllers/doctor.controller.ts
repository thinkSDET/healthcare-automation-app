/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import * as doctorService from "../services/doctor.service";

export const getDoctors = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role?.toUpperCase();
    const doctors = await doctorService.getDoctors({
      activeOnly: role === "PATIENT",
    });

    res.status(200).json({
      success: true,
      data: doctors
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors"
    });
  }
};

export const getDoctorById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const role = req.user?.role?.toUpperCase();

    const doctor = await doctorService.getDoctorById(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    if (role === "PATIENT" && doctor.status !== "ACTIVE") {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor"
    });
  }
};

export const createDoctor = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const doctor = await doctorService.createDoctor(req.body);

    res.status(201).json({
      success: true,
      data: doctor
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to create doctor"
    });
  }
};

export const updateDoctor = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const doctor = await doctorService.updateDoctor(
      id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to update doctor"
    });
  }
};

export const deleteDoctor = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    await doctorService.deleteDoctor(id);

    res.status(204).send();
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to delete doctor"
    });
  }
};
