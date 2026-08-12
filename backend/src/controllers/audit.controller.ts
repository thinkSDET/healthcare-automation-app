import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import * as auditService from "../services/audit.service";
import { listAuditEventsQuerySchema } from "../validators/audit.validator";

export const listAuditEvents = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const parsed = listAuditEventsQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const {
      actorUserId,
      action,
      entityType,
      entityId,
      from,
      to,
      limit = 50,
      offset = 0,
    } = parsed.data;

    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    if (fromDate && Number.isNaN(fromDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid from date",
      });
    }

    if (toDate && Number.isNaN(toDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid to date",
      });
    }

    const filters: {
      actorUserId?: number;
      action?: string;
      entityType?: string;
      entityId?: number;
      from?: Date;
      to?: Date;
      limit: number;
      offset: number;
    } = {
      limit,
      offset,
    };

    if (actorUserId !== undefined) {
      filters.actorUserId = actorUserId;
    }
    if (action) {
      filters.action = action;
    }
    if (entityType) {
      filters.entityType = entityType;
    }
    if (entityId !== undefined) {
      filters.entityId = entityId;
    }
    if (fromDate) {
      filters.from = fromDate;
    }
    if (toDate) {
      filters.to = toDate;
    }

    const result = await auditService.listAuditEvents(filters);

    return res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    console.error("LIST AUDIT EVENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit events",
    });
  }
};
