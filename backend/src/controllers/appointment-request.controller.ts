import type { Response } from "express";
import { prisma } from "../config/prisma";
import type { AuthRequest } from "../middleware/auth";
import * as appointmentRequestService from "../services/appointment-request.service";

const getOwnPatientId = async (userId: number) => {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    select: { id: true },
  });
  return patient?.id ?? null;
};

const mapError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return { status: 500, message: "Unexpected error" };
  }

  switch (error.message) {
    case "APPOINTMENT_REQUEST_NOT_FOUND":
      return { status: 404, message: "Appointment request not found" };
    case "PATIENT_NOT_FOUND":
      return { status: 404, message: "Patient not found" };
    case "DOCTOR_NOT_FOUND":
    case "Doctor not found":
      return { status: 404, message: "Doctor not found" };
    case "DUPLICATE_SUBMITTED_REQUEST":
      return {
        status: 409,
        message:
          "A submitted request already exists for this doctor and time",
      };
    case "REQUEST_IN_PAST":
    case "Appointment cannot be scheduled in the past":
      return {
        status: 400,
        message: "Requested time must be in the future",
      };
    case "INVALID_DURATION":
    case "Appointment duration must be greater than 0":
      return { status: 400, message: "Invalid appointment duration" };
    case "PATIENT_NOT_ACTIVE":
      return { status: 400, message: "Patient account is not active" };
    case "DOCTOR_NOT_ACTIVE":
    case "Doctor is not active and cannot receive appointments":
      return {
        status: 400,
        message: "Doctor is not active and cannot receive appointments",
      };
    case "DOCTOR_OVERLAP":
    case "Doctor already has an overlapping appointment":
      return {
        status: 409,
        message: "Doctor already has an overlapping appointment",
      };
    case "PATIENT_OVERLAP":
    case "Patient already has an overlapping appointment":
      return {
        status: 409,
        message: "Patient already has an overlapping appointment",
      };
    case "FORBIDDEN":
      return {
        status: 403,
        message: "You do not have permission to perform this action",
      };
    case "NO_PATIENT_LINK":
      return {
        status: 403,
        message: "No patient record is linked to this account",
      };
    case "INVALID_STATUS_TRANSITION":
      return {
        status: 400,
        message: "Invalid appointment request status transition",
      };
    case "REJECTION_REASON_REQUIRED":
      return {
        status: 400,
        message: "Rejection reason is required",
      };
    default:
      return {
        status: 500,
        message: "Failed to process appointment request",
      };
  }
};

export const createAppointmentRequest = async (
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

    const role = req.user.role.toUpperCase();
    const ownPatientId = await getOwnPatientId(req.user.userId);

    const data =
      await appointmentRequestService.createAppointmentRequest({
        doctorId: req.body.doctorId,
        requestedAt: new Date(req.body.requestedAt),
        duration: req.body.duration,
        type: req.body.type,
        reason: req.body.reason,
        notes: req.body.notes,
        requestedByUserId: req.user.userId,
        role,
        ownPatientId,
      });

    return res.status(201).json({
      success: true,
      message: "Appointment request submitted",
      data,
    });
  } catch (error) {
    console.error("CREATE APPOINTMENT REQUEST ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const listAppointmentRequests = async (
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

    const role = req.user.role.toUpperCase();
    const ownPatientId =
      role === "PATIENT"
        ? await getOwnPatientId(req.user.userId)
        : null;

    const status = req.query.status
      ? String(req.query.status).toUpperCase()
      : undefined;
    const doctorId = req.query.doctorId
      ? Number(req.query.doctorId)
      : undefined;
    const patientId = req.query.patientId
      ? Number(req.query.patientId)
      : undefined;

    if (doctorId !== undefined && Number.isNaN(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    if (patientId !== undefined && Number.isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const filters: {
      role: string;
      ownPatientId: number | null;
      status?:
        | "SUBMITTED"
        | "APPROVED"
        | "REJECTED"
        | "CANCELLED";
      doctorId?: number;
      patientId?: number;
    } = {
      role,
      ownPatientId,
    };

    if (
      status === "SUBMITTED" ||
      status === "APPROVED" ||
      status === "REJECTED" ||
      status === "CANCELLED"
    ) {
      filters.status = status;
    }

    if (doctorId !== undefined) {
      filters.doctorId = doctorId;
    }

    if (patientId !== undefined) {
      filters.patientId = patientId;
    }

    const data =
      await appointmentRequestService.listAppointmentRequests(filters);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("LIST APPOINTMENT REQUESTS ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const getAppointmentRequestById = async (
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
    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment request ID",
      });
    }

    const role = req.user.role.toUpperCase();
    const ownPatientId =
      role === "PATIENT"
        ? await getOwnPatientId(req.user.userId)
        : null;

    const data =
      await appointmentRequestService.getAppointmentRequestById(id, {
        role,
        ownPatientId,
      });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET APPOINTMENT REQUEST ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const updateAppointmentRequestStatus = async (
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
    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment request ID",
      });
    }

    const role = req.user.role.toUpperCase();
    const ownPatientId =
      role === "PATIENT"
        ? await getOwnPatientId(req.user.userId)
        : null;

    const data =
      await appointmentRequestService.updateAppointmentRequestStatus({
        id,
        nextStatus: req.body.status,
        rejectionReason: req.body.rejectionReason,
        actorUserId: req.user.userId,
        role,
        ownPatientId,
      });

    return res.status(200).json({
      success: true,
      message: "Appointment request status updated",
      data,
    });
  } catch (error) {
    console.error("UPDATE APPOINTMENT REQUEST STATUS ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};
