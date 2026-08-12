/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import * as appointmentService from "../services/appointment.service";
import type { AppointmentStatusValue } from "../services/appointment.service";

const mapAppointmentError = (error: unknown): {
  status: number;
  message: string;
} => {
  const message =
    error instanceof Error
      ? error.message
      : "Appointment operation failed";

  switch (message) {
    case "Appointment not found":
    case "Patient not found":
    case "Doctor not found":
      return { status: 404, message };

    case "You do not have permission to perform this appointment status change":
      return { status: 403, message };

    case "Doctor already has an overlapping appointment":
    case "Patient already has an overlapping appointment":
      return { status: 409, message };

    case "Invalid appointment status transition":
    case "Cannot modify a terminal appointment":
    case "Appointment schedule can only be edited when SCHEDULED or CONFIRMED":
    case "Only scheduled appointments can be cancelled":
    case "Appointment cannot be scheduled in the past":
    case "Appointment duration must be greater than 0":
    case "Doctor is not active and cannot receive appointments":
      return { status: 400, message };

    default:
      return { status: 500, message };
  }
};

export const getAppointments = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const appointments =
      await appointmentService.getAppointments();

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
};

export const getAppointmentById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointment =
      await appointmentService.getAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
    });
  }
};

export const createAppointment = async (
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

    const appointment =
      await appointmentService.createAppointment(
        {
          ...req.body,
          appointmentAt: new Date(req.body.appointmentAt),
        },
        {
          actorUserId: req.user.userId,
          actorRole: req.user.role,
        }
      );

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    const mapped = mapAppointmentError(error);

    res.status(mapped.status).json({
      success: false,
      message:
        mapped.status === 500
          ? "Failed to create appointment"
          : mapped.message,
    });
  }
};

export const updateAppointment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const data = {
      ...req.body,
      ...(req.body.appointmentAt && {
        appointmentAt: new Date(req.body.appointmentAt),
      }),
    };

    const appointment =
      await appointmentService.updateAppointment(id, data, {
        actorUserId: req.user.userId,
        actorRole: req.user.role,
      });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    const mapped = mapAppointmentError(error);

    res.status(mapped.status).json({
      success: false,
      message:
        mapped.status === 500
          ? "Failed to update appointment"
          : mapped.message,
    });
  }
};

export const updateAppointmentStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const appointment =
      await appointmentService.updateAppointmentStatus(
        id,
        req.body.status as AppointmentStatusValue,
        req.user.role,
        {
          actorUserId: req.user.userId,
          actorRole: req.user.role,
        }
      );

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    const mapped = mapAppointmentError(error);

    res.status(mapped.status).json({
      success: false,
      message:
        mapped.status === 500
          ? "Failed to update appointment status"
          : mapped.message,
    });
  }
};

export const cancelAppointment = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const appointment =
      await appointmentService.cancelAppointment(id, {
        actorUserId: req.user.userId,
        actorRole: req.user.role,
      });

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    const mapped = mapAppointmentError(error);

    res.status(mapped.status).json({
      success: false,
      message:
        mapped.status === 500
          ? "Failed to cancel appointment"
          : mapped.message,
    });
  }
};
