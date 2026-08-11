import type { Response } from "express";
import { prisma } from "../config/prisma";
import type { AuthRequest } from "../middleware/auth";
import * as refillRequestService from "../services/refill-request.service";

const getOwnPatientId = async (userId: number) => {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    select: { id: true },
  });
  return patient?.id ?? null;
};

const mapError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return {
      status: 500,
      message: "Unexpected error",
    };
  }

  switch (error.message) {
    case "PRESCRIPTION_NOT_FOUND":
      return { status: 404, message: "Prescription not found" };
    case "REFILL_REQUEST_NOT_FOUND":
      return { status: 404, message: "Refill request not found" };
    case "PATIENT_NOT_FOUND":
      return { status: 404, message: "Patient not found" };
    case "DUPLICATE_SUBMITTED_REQUEST":
      return {
        status: 409,
        message:
          "A submitted refill/renewal request already exists for this prescription",
      };
    case "PRESCRIPTION_NOT_ELIGIBLE":
      return {
        status: 400,
        message: "Prescription is not eligible for this request type",
      };
    case "PATIENT_NOT_ACTIVE":
      return {
        status: 400,
        message: "Patient account is not active",
      };
    case "PHARMACIST_CANNOT_REQUEST_RENEWAL":
      return {
        status: 403,
        message: "Pharmacists cannot initiate renewal requests",
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
        message: "Invalid refill request status transition",
      };
    case "REJECTION_REASON_REQUIRED":
      return {
        status: 400,
        message: "Rejection reason is required",
      };
    case "REQUEST_NOT_APPROVED":
      return {
        status: 400,
        message: "Only approved requests can create an order",
      };
    case "ORDER_ALREADY_LINKED":
      return {
        status: 409,
        message: "An order is already linked to this request",
      };
    case "ORDER_ITEMS_REQUIRED":
    case "INVALID_ORDER_ITEM":
      return {
        status: 400,
        message: "Invalid order items",
      };
    default:
      return {
        status: 500,
        message: "Failed to process refill request",
      };
  }
};

export const createRefillRequest = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const prescriptionId = Number(req.params.id);
    if (Number.isNaN(prescriptionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid prescription ID",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const data = await refillRequestService.createRefillRequest({
      prescriptionId,
      requestType: req.body.requestType,
      notes: req.body.notes,
      requestedByUserId: req.user.userId,
      role: req.user.role.toUpperCase(),
    });

    return res.status(201).json({
      success: true,
      message: "Refill request submitted",
      data,
    });
  } catch (error) {
    console.error("CREATE REFILL REQUEST ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const listRefillRequests = async (
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
    const requestType = req.query.requestType
      ? String(req.query.requestType).toUpperCase()
      : undefined;
    const patientId = req.query.patientId
      ? Number(req.query.patientId)
      : undefined;

    const filters: {
      role: string;
      userId: number;
      ownPatientId: number | null;
      status?: "SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED" | "FULFILLED";
      requestType?: "REFILL" | "RENEWAL";
      patientId?: number;
    } = {
      role,
      userId: req.user.userId,
      ownPatientId,
    };

    if (
      status === "SUBMITTED" ||
      status === "APPROVED" ||
      status === "REJECTED" ||
      status === "CANCELLED" ||
      status === "FULFILLED"
    ) {
      filters.status = status;
    }

    if (requestType === "REFILL" || requestType === "RENEWAL") {
      filters.requestType = requestType;
    }

    if (patientId !== undefined && !Number.isNaN(patientId)) {
      filters.patientId = patientId;
    }

    const data = await refillRequestService.listRefillRequests(filters);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("LIST REFILL REQUESTS ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const getRefillRequestById = async (
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
        message: "Invalid refill request ID",
      });
    }

    const role = req.user.role.toUpperCase();
    const ownPatientId =
      role === "PATIENT"
        ? await getOwnPatientId(req.user.userId)
        : null;

    const data = await refillRequestService.getRefillRequestById(id, {
      role,
      userId: req.user.userId,
      ownPatientId,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("GET REFILL REQUEST ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const updateRefillRequestStatus = async (
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
        message: "Invalid refill request ID",
      });
    }

    const data = await refillRequestService.updateRefillRequestStatus({
      id,
      nextStatus: req.body.status,
      rejectionReason: req.body.rejectionReason,
      actorUserId: req.user.userId,
      role: req.user.role.toUpperCase(),
    });

    return res.status(200).json({
      success: true,
      message: "Refill request status updated",
      data,
    });
  } catch (error) {
    console.error("UPDATE REFILL REQUEST STATUS ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const createOrderFromRefillRequest = async (
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
        message: "Invalid refill request ID",
      });
    }

    const role = req.user.role.toUpperCase();
    const ownPatientId =
      role === "PATIENT"
        ? await getOwnPatientId(req.user.userId)
        : null;

    const data =
      await refillRequestService.createOrderFromRefillRequest({
        id,
        actorUserId: req.user.userId,
        role,
        ownPatientId,
        deliveryAddress: req.body.deliveryAddress,
        notes: req.body.notes,
        items: req.body.items,
      });

    return res.status(201).json({
      success: true,
      message: "Order created from refill request",
      data,
    });
  } catch (error) {
    console.error("CREATE ORDER FROM REFILL REQUEST ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};
