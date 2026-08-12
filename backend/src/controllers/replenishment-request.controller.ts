import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import * as replenishmentRequestService from "../services/replenishment-request.service";

const mapError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return { status: 500, message: "Unexpected error" };
  }

  switch (error.message) {
    case "MEDICATION_NOT_FOUND":
      return { status: 404, message: "Medication not found" };
    case "REPLENISHMENT_REQUEST_NOT_FOUND":
      return { status: 404, message: "Replenishment request not found" };
    case "DUPLICATE_OPEN_REQUEST":
      return {
        status: 409,
        message:
          "An open replenishment request already exists for this medication",
      };
    case "MEDICATION_INACTIVE":
      return { status: 400, message: "Medication is inactive" };
    case "INVALID_QUANTITY":
      return { status: 400, message: "Quantity must be a positive integer" };
    case "FORBIDDEN":
      return {
        status: 403,
        message: "You do not have permission to perform this action",
      };
    case "INVALID_STATUS_TRANSITION":
      return {
        status: 400,
        message: "Invalid replenishment request status transition",
      };
    case "REJECTION_REASON_REQUIRED":
      return { status: 400, message: "Rejection reason is required" };
    case "CONCURRENT_STOCK_UPDATE":
      return {
        status: 409,
        message: "Stock was updated concurrently; please retry",
      };
    default:
      return {
        status: 500,
        message: "Failed to process replenishment request",
      };
  }
};

export const listReplenishmentRequests = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const status = req.query.status
      ? String(req.query.status).toUpperCase()
      : undefined;
    const medicationId = req.query.medicationId
      ? Number(req.query.medicationId)
      : undefined;

    const filters: {
      status?:
        | "SUBMITTED"
        | "APPROVED"
        | "REJECTED"
        | "CANCELLED"
        | "RECEIVED";
      medicationId?: number;
    } = {};

    if (
      status === "SUBMITTED" ||
      status === "APPROVED" ||
      status === "REJECTED" ||
      status === "CANCELLED" ||
      status === "RECEIVED"
    ) {
      filters.status = status;
    }
    if (medicationId !== undefined && !Number.isNaN(medicationId)) {
      filters.medicationId = medicationId;
    }

    const data =
      await replenishmentRequestService.listReplenishmentRequests(filters);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("LIST REPLENISHMENT REQUESTS ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const getReplenishmentRequestById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid replenishment request ID",
      });
    }

    const data =
      await replenishmentRequestService.getReplenishmentRequestById(id);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("GET REPLENISHMENT REQUEST ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const createReplenishmentRequest = async (
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

    const data = await replenishmentRequestService.createReplenishmentRequest({
      medicationId: req.body.medicationId,
      requestedQuantity: req.body.requestedQuantity,
      notes: req.body.notes,
      requestedByUserId: req.user.userId,
      role: req.user.role.toUpperCase(),
    });

    return res.status(201).json({
      success: true,
      message: "Replenishment request submitted",
      data,
    });
  } catch (error) {
    console.error("CREATE REPLENISHMENT REQUEST ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const updateReplenishmentRequestStatus = async (
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
        message: "Invalid replenishment request ID",
      });
    }

    const data =
      await replenishmentRequestService.updateReplenishmentRequestStatus({
        id,
        nextStatus: req.body.status,
        rejectionReason: req.body.rejectionReason,
        receivedQuantity: req.body.receivedQuantity,
        actorUserId: req.user.userId,
        role: req.user.role.toUpperCase(),
      });

    return res.status(200).json({
      success: true,
      message: "Replenishment request updated",
      data,
    });
  } catch (error) {
    console.error("UPDATE REPLENISHMENT REQUEST STATUS ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};
