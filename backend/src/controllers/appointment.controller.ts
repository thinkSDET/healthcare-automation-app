import { Request, Response } from "express";
import * as appointmentService from "../services/appointment.service";

export const getAppointments = async (
  _req: Request,
  res: Response
) => {
  try {
    const appointments =
      await appointmentService.getAppointments();

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments"
    });
  }
};

export const getAppointmentById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const appointment =
      await appointmentService.getAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointment"
    });
  }
};

export const createAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const appointment =
      await appointmentService.createAppointment({
        ...req.body,
        appointmentAt: new Date(req.body.appointmentAt)
      });

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create appointment";

    res.status(409).json({
      success: false,
      message
    });
  }
};

export const updateAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const data = {
      ...req.body,
      ...(req.body.appointmentAt && {
        appointmentAt: new Date(req.body.appointmentAt)
      })
    };

    const appointment =
      await appointmentService.updateAppointment(id, data);

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to update appointment"
    });
  }
};

export const cancelAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const appointment =
      await appointmentService.cancelAppointment(id);

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment"
    });
  }
};