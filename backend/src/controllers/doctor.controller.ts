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


export const getPendingDoctorRegistrationRequestCount = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const count =
      await doctorService.getPendingDoctorRegistrationRequestCount();

    return res.status(200).json({
      success: true,
      data: { count }
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending doctor registration request count"
    });
  }
};

export const getMyDoctorRegistrationRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found"
      });
    }

    const request =
      await doctorService.getMyDoctorRegistrationRequest(userId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Doctor registration request not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: request
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor registration request"
    });
  }
};

export const getDoctorRegistrationRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const requests =
      await doctorService.getDoctorRegistrationRequests();

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor registration requests"
    });
  }
};

export const approveDoctorRegistrationRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const requestId = Number(req.params.id);

    if (!Number.isInteger(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration request id"
      });
    }

    const adminUserId = req.user?.userId;

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated admin user not found"
      });
    }

    const doctor =
      await doctorService.approveDoctorRegistrationRequest(
        requestId,
        adminUserId
      );

    res.status(200).json({
      success: true,
      data: doctor,
      message: "Doctor registration approved"
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to approve doctor registration";

    if (message === "DOCTOR_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message:
          "Approval blocked: a doctor with the same email or license number already exists."
      });
    }

    if (message === "DOCTOR_REGISTRATION_REQUEST_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Doctor registration request not found."
      });
    }

    if (message === "DOCTOR_REGISTRATION_REQUEST_ALREADY_REVIEWED") {
      return res.status(409).json({
        success: false,
        message: "This doctor registration request has already been reviewed."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to approve doctor registration."
    });
  }
};

export const rejectDoctorRegistrationRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const requestId = Number(req.params.id);

    if (!Number.isInteger(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration request id"
      });
    }

    const adminUserId = req.user?.userId;

    if (!adminUserId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated admin user not found"
      });
    }

    const rejectionReason =
      typeof req.body?.rejectionReason === "string"
        ? req.body.rejectionReason.trim()
        : undefined;

    const request =
      await doctorService.rejectDoctorRegistrationRequest(
        requestId,
        adminUserId,
        rejectionReason
      );

    res.status(200).json({
      success: true,
      data: request,
      message: "Doctor registration rejected"
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to reject doctor registration";

    res.status(400).json({
      success: false,
      message
    });
  }
};