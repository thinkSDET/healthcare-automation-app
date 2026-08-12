import fs from "fs";
import path from "path";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import * as labOrderService from "../services/lab-order.service";

const mapError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return { status: 500, message: "Unexpected error" };
  }

  switch (error.message) {
    case "PATIENT_NOT_FOUND":
      return { status: 404, message: "Patient not found" };
    case "DOCTOR_NOT_FOUND":
      return { status: 404, message: "Doctor not found" };
    case "DOCTOR_NOT_ACTIVE":
      return {
        status: 400,
        message: "Doctor must be ACTIVE to create a lab test order",
      };
    case "APPOINTMENT_NOT_FOUND":
      return { status: 404, message: "Appointment not found" };
    case "APPOINTMENT_PATIENT_MISMATCH":
      return {
        status: 400,
        message: "Appointment does not belong to the selected patient",
      };
    case "APPOINTMENT_DOCTOR_MISMATCH":
      return {
        status: 400,
        message: "Appointment does not belong to the selected doctor",
      };
    case "LAB_TEST_ORDER_NOT_FOUND":
      return { status: 404, message: "Lab test order not found" };
    case "PATIENT_PROFILE_NOT_FOUND":
      return { status: 404, message: "Patient profile not found for user" };
    case "FORBIDDEN":
      return {
        status: 403,
        message: "You do not have permission to perform this action",
      };
    case "INVALID_STATUS_TRANSITION":
      return {
        status: 400,
        message: "Invalid lab test order status transition",
      };
    case "REJECTION_REASON_REQUIRED":
      return { status: 400, message: "Rejection reason is required" };
    case "RESULT_SUMMARY_REQUIRED":
      return { status: 400, message: "Result summary is required" };
    case "RESULT_IMMUTABLE":
      return {
        status: 400,
        message: "Acknowledged results cannot be modified",
      };
    case "RESULT_MISSING":
      return { status: 400, message: "Result is missing for this order" };
    case "RESULT_NOT_AVAILABLE":
      return {
        status: 403,
        message: "Result is not available until acknowledged",
      };
    case "RESULT_FILE_NOT_FOUND":
      return { status: 404, message: "Result file not found" };
    default:
      return {
        status: 500,
        message: "Failed to process lab test order",
      };
  }
};

const STATUS_VALUES = [
  "REQUESTED",
  "SAMPLE_COLLECTED",
  "PROCESSING",
  "RESULT_AVAILABLE",
  "ACKNOWLEDGED",
  "CANCELLED",
  "REJECTED",
] as const;

export const listLabTestOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const statusRaw = req.query.status
      ? String(req.query.status).toUpperCase()
      : undefined;
    const patientId = req.query.patientId
      ? Number(req.query.patientId)
      : undefined;
    const doctorId = req.query.doctorId
      ? Number(req.query.doctorId)
      : undefined;

    const filters: {
      status?: (typeof STATUS_VALUES)[number];
      patientId?: number;
      doctorId?: number;
    } = {};

    if (
      statusRaw &&
      (STATUS_VALUES as readonly string[]).includes(statusRaw)
    ) {
      filters.status = statusRaw as (typeof STATUS_VALUES)[number];
    }
    if (patientId !== undefined && !Number.isNaN(patientId)) {
      filters.patientId = patientId;
    }
    if (doctorId !== undefined && !Number.isNaN(doctorId)) {
      filters.doctorId = doctorId;
    }

    const data = await labOrderService.listLabTestOrders({
      role: req.user.role.toUpperCase(),
      actorUserId: req.user.userId,
      ...filters,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("LIST LAB TEST ORDERS ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const getLabTestOrderById = async (
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
        message: "Invalid lab test order ID",
      });
    }

    const data = await labOrderService.getLabTestOrderById({
      id,
      role: req.user.role.toUpperCase(),
      actorUserId: req.user.userId,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("GET LAB TEST ORDER ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const createLabTestOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const data = await labOrderService.createLabTestOrder({
      patientId: req.body.patientId,
      doctorId: req.body.doctorId,
      testName: req.body.testName,
      appointmentId: req.body.appointmentId,
      notes: req.body.notes,
      orderedAt: req.body.orderedAt,
      createdByUserId: req.user.userId,
      role: req.user.role.toUpperCase(),
    });

    return res.status(201).json({
      success: true,
      message: "Lab test order created",
      data,
    });
  } catch (error) {
    console.error("CREATE LAB TEST ORDER ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const updateLabTestOrderStatus = async (
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
        message: "Invalid lab test order ID",
      });
    }

    const data = await labOrderService.updateLabTestOrderStatus({
      id,
      nextStatus: req.body.status,
      rejectionReason: req.body.rejectionReason,
      actorUserId: req.user.userId,
      role: req.user.role.toUpperCase(),
    });

    return res.status(200).json({
      success: true,
      message: "Lab test order status updated",
      data,
    });
  } catch (error) {
    console.error("UPDATE LAB TEST ORDER STATUS ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const uploadLabTestResult = async (
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
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Invalid lab test order ID",
      });
    }

    const resultSummary = String(req.body.resultSummary || "").trim();
    const resultFlag = String(req.body.resultFlag || "")
      .trim()
      .toUpperCase();

    if (!resultSummary) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Result summary is required",
      });
    }

    if (
      resultFlag !== "NORMAL" &&
      resultFlag !== "ABNORMAL" &&
      resultFlag !== "CRITICAL"
    ) {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Result flag must be NORMAL, ABNORMAL, or CRITICAL",
      });
    }

    const uploadInput: Parameters<
      typeof labOrderService.uploadLabTestResult
    >[0] = {
      id,
      resultSummary,
      resultFlag,
      actorUserId: req.user.userId,
      role: req.user.role.toUpperCase(),
    };

    if (req.file) {
      uploadInput.file = {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        filePath: req.file.path,
      };
    }

    const data = await labOrderService.uploadLabTestResult(uploadInput);

    return res.status(200).json({
      success: true,
      message: "Lab result uploaded",
      data,
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("UPLOAD LAB TEST RESULT ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const acknowledgeLabTestOrder = async (
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
        message: "Invalid lab test order ID",
      });
    }

    const data = await labOrderService.acknowledgeLabTestOrder({
      id,
      actorUserId: req.user.userId,
      role: req.user.role.toUpperCase(),
    });

    return res.status(200).json({
      success: true,
      message: "Lab result acknowledged",
      data,
    });
  } catch (error) {
    console.error("ACKNOWLEDGE LAB TEST ORDER ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const downloadLabTestResult = async (
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
        message: "Invalid lab test order ID",
      });
    }

    const download = await labOrderService.getLabResultDownload({
      id,
      role: req.user.role.toUpperCase(),
      actorUserId: req.user.userId,
    });

    return res.download(
      path.resolve(download.filePath),
      download.originalName
    );
  } catch (error) {
    console.error("DOWNLOAD LAB TEST RESULT ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};
