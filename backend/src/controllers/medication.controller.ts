/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import * as medicationService from "../services/medication.service";

const mapError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return { status: 500, message: "Unexpected error" };
  }

  switch (error.message) {
    case "MEDICATION_NOT_FOUND":
      return { status: 404, message: "Medication not found" };
    case "DUPLICATE_SKU":
      return { status: 409, message: "A medication with this SKU already exists" };
    case "INVALID_QUANTITY":
      return { status: 400, message: "Quantity values must be non-negative integers" };
    case "INVALID_MEDICATION_FIELDS":
      return { status: 400, message: "SKU, name, and unit are required" };
    case "ADJUST_REASON_REQUIRED":
      return { status: 400, message: "Adjustment reason is required" };
    case "INVALID_DELTA":
      return { status: 400, message: "Delta must be a non-zero integer" };
    case "NEGATIVE_STOCK":
      return { status: 400, message: "Stock cannot become negative" };
    case "MEDICATION_INACTIVE":
      return { status: 400, message: "Medication is inactive" };
    case "CONCURRENT_STOCK_UPDATE":
      return {
        status: 409,
        message: "Stock was updated concurrently; please retry",
      };
    default:
      return { status: 500, message: "Failed to process medication request" };
  }
};

const requireUser = (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return null;
  }
  return {
    actorUserId: req.user.userId,
    actorRole: req.user.role.toUpperCase(),
  };
};

export const listMedications = async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status
      ? String(req.query.status).toUpperCase()
      : undefined;
    const stockStatus = req.query.stockStatus
      ? String(req.query.stockStatus).toUpperCase()
      : undefined;
    const q = req.query.q ? String(req.query.q) : undefined;

    const filters: {
      status?: "ACTIVE" | "INACTIVE";
      stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
      q?: string;
    } = {};

    if (status === "ACTIVE" || status === "INACTIVE") {
      filters.status = status;
    }
    if (
      stockStatus === "IN_STOCK" ||
      stockStatus === "LOW_STOCK" ||
      stockStatus === "OUT_OF_STOCK"
    ) {
      filters.stockStatus = stockStatus;
    }
    if (q) {
      filters.q = q;
    }

    const data = await medicationService.listMedications(filters);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("LIST MEDICATIONS ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const getMedicationById = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medication ID",
      });
    }

    const data = await medicationService.getMedicationById(id);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("GET MEDICATION ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const createMedication = async (req: AuthRequest, res: Response) => {
  try {
    const auditContext = requireUser(req, res);
    if (!auditContext) {
      return;
    }

    const data = await medicationService.createMedication(
      req.body,
      auditContext
    );

    return res.status(201).json({
      success: true,
      message: "Medication created",
      data,
    });
  } catch (error) {
    console.error("CREATE MEDICATION ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const updateMedication = async (req: AuthRequest, res: Response) => {
  try {
    const auditContext = requireUser(req, res);
    if (!auditContext) {
      return;
    }

    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medication ID",
      });
    }

    const data = await medicationService.updateMedication(
      id,
      req.body,
      auditContext
    );

    return res.status(200).json({
      success: true,
      message: "Medication updated",
      data,
    });
  } catch (error) {
    console.error("UPDATE MEDICATION ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const adjustMedicationStock = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const auditContext = requireUser(req, res);
    if (!auditContext) {
      return;
    }

    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medication ID",
      });
    }

    const data = await medicationService.adjustMedicationStock(
      id,
      {
        delta: req.body.delta,
        reason: req.body.reason,
      },
      auditContext
    );

    return res.status(200).json({
      success: true,
      message: "Stock adjusted",
      data,
    });
  } catch (error) {
    console.error("ADJUST MEDICATION STOCK ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};

export const listMedicationMovements = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medication ID",
      });
    }

    const limitRaw = req.query.limit ? Number(req.query.limit) : 50;
    const offsetRaw = req.query.offset ? Number(req.query.offset) : 0;
    const limit =
      Number.isInteger(limitRaw) && limitRaw >= 1 && limitRaw <= 100
        ? limitRaw
        : 50;
    const offset =
      Number.isInteger(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;

    const result = await medicationService.listMedicationMovements(id, {
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error("LIST MEDICATION MOVEMENTS ERROR:", error);
    const mapped = mapError(error);
    return res.status(mapped.status).json({
      success: false,
      message: mapped.message,
    });
  }
};
