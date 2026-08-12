/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { prisma } from "../config/prisma";
import {
  safeRecordAuditEvent,
  type AuditAction,
} from "./audit.service";
import { deriveStockStatus } from "./medication.service";

export type ReplenishmentStatusValue =
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "RECEIVED";

const detailInclude = {
  medication: true,
  requestedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  },
  reviewedBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  },
} as const;

const withMedicationStockStatus = <
  T extends {
    medication: {
      quantityOnHand: number;
      reorderLevel: number;
    };
  }
>(
  request: T
) => ({
  ...request,
  medication: {
    ...request.medication,
    stockStatus: deriveStockStatus(
      request.medication.quantityOnHand,
      request.medication.reorderLevel
    ),
  },
});

export const createReplenishmentRequest = async (input: {
  medicationId: number;
  requestedQuantity: number;
  notes?: string;
  requestedByUserId: number;
  role: string;
}) => {
  const {
    medicationId,
    requestedQuantity,
    notes,
    requestedByUserId,
    role,
  } = input;

  if (role !== "ADMIN" && role !== "PHARMACIST") {
    throw new Error("FORBIDDEN");
  }

  if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) {
    throw new Error("INVALID_QUANTITY");
  }

  const medication = await prisma.medication.findUnique({
    where: { id: medicationId },
  });

  if (!medication) {
    throw new Error("MEDICATION_NOT_FOUND");
  }

  if (medication.status !== "ACTIVE") {
    throw new Error("MEDICATION_INACTIVE");
  }

  const openExisting = await prisma.replenishmentRequest.findFirst({
    where: {
      medicationId,
      status: { in: ["SUBMITTED", "APPROVED"] },
    },
  });

  if (openExisting) {
    throw new Error("DUPLICATE_OPEN_REQUEST");
  }

  const requestNo = `RP-${Date.now()}`;

  const created = await prisma.replenishmentRequest.create({
    data: {
      requestNo,
      medicationId,
      requestedQuantity,
      status: "SUBMITTED",
      requestedByUserId,
      notes: notes?.trim() || null,
    },
    include: detailInclude,
  });

  await safeRecordAuditEvent({
    actorUserId: requestedByUserId,
    actorRole: role,
    action: "CREATE",
    entityType: "REPLENISHMENT_REQUEST",
    entityId: created.id,
    metadata: {
      requestNo: created.requestNo,
      medicationId: created.medicationId,
      requestedQuantity: created.requestedQuantity,
      sku: medication.sku,
    },
  });

  return withMedicationStockStatus(created);
};

export const listReplenishmentRequests = async (filters: {
  status?: ReplenishmentStatusValue;
  medicationId?: number;
}) => {
  const where: Record<string, unknown> = {};

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.medicationId !== undefined) {
    where.medicationId = filters.medicationId;
  }

  const rows = await prisma.replenishmentRequest.findMany({
    where,
    include: detailInclude,
    orderBy: { createdAt: "desc" },
  });

  return rows.map(withMedicationStockStatus);
};

export const getReplenishmentRequestById = async (id: number) => {
  const request = await prisma.replenishmentRequest.findUnique({
    where: { id },
    include: detailInclude,
  });

  if (!request) {
    throw new Error("REPLENISHMENT_REQUEST_NOT_FOUND");
  }

  return withMedicationStockStatus(request);
};

export const updateReplenishmentRequestStatus = async (input: {
  id: number;
  nextStatus: "APPROVED" | "REJECTED" | "CANCELLED" | "RECEIVED";
  rejectionReason?: string;
  receivedQuantity?: number;
  actorUserId: number;
  role: string;
}) => {
  const {
    id,
    nextStatus,
    rejectionReason,
    receivedQuantity,
    actorUserId,
    role,
  } = input;

  const existing = await prisma.replenishmentRequest.findUnique({
    where: { id },
    include: { medication: true },
  });

  if (!existing) {
    throw new Error("REPLENISHMENT_REQUEST_NOT_FOUND");
  }

  const current = existing.status as ReplenishmentStatusValue;

  if (nextStatus === "CANCELLED") {
    if (current !== "SUBMITTED") {
      throw new Error("INVALID_STATUS_TRANSITION");
    }
    const isAdmin = role === "ADMIN";
    const isRequester = existing.requestedByUserId === actorUserId;
    if (!isAdmin && !isRequester) {
      throw new Error("FORBIDDEN");
    }

    const updated = await prisma.replenishmentRequest.updateMany({
      where: { id, status: "SUBMITTED" },
      data: {
        status: "CANCELLED",
        reviewedByUserId: null,
        reviewedAt: null,
        rejectionReason: null,
      },
    });

    if (updated.count === 0) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }

    const result = await prisma.replenishmentRequest.findUniqueOrThrow({
      where: { id },
      include: detailInclude,
    });

    await safeRecordAuditEvent({
      actorUserId,
      actorRole: role,
      action: "CANCEL",
      entityType: "REPLENISHMENT_REQUEST",
      entityId: result.id,
      metadata: {
        requestNo: result.requestNo,
        from: "SUBMITTED",
        to: "CANCELLED",
      },
    });

    return withMedicationStockStatus(result);
  }

  if (nextStatus === "APPROVED" || nextStatus === "REJECTED") {
    if (role !== "ADMIN") {
      throw new Error("FORBIDDEN");
    }
    if (current !== "SUBMITTED") {
      throw new Error("INVALID_STATUS_TRANSITION");
    }
    if (nextStatus === "REJECTED" && !rejectionReason?.trim()) {
      throw new Error("REJECTION_REASON_REQUIRED");
    }

    const updated = await prisma.replenishmentRequest.updateMany({
      where: { id, status: "SUBMITTED" },
      data: {
        status: nextStatus,
        rejectionReason:
          nextStatus === "REJECTED" ? rejectionReason!.trim() : null,
        reviewedByUserId: actorUserId,
        reviewedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }

    const result = await prisma.replenishmentRequest.findUniqueOrThrow({
      where: { id },
      include: detailInclude,
    });

    const action: AuditAction =
      nextStatus === "APPROVED" ? "APPROVE" : "REJECT";

    await safeRecordAuditEvent({
      actorUserId,
      actorRole: role,
      action,
      entityType: "REPLENISHMENT_REQUEST",
      entityId: result.id,
      metadata: {
        requestNo: result.requestNo,
        from: "SUBMITTED",
        to: nextStatus,
      },
    });

    return withMedicationStockStatus(result);
  }

  // RECEIVED
  if (role !== "ADMIN" && role !== "PHARMACIST") {
    throw new Error("FORBIDDEN");
  }
  if (current !== "APPROVED") {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  const qty =
    receivedQuantity !== undefined
      ? receivedQuantity
      : existing.requestedQuantity;

  if (!Number.isInteger(qty) || qty <= 0) {
    throw new Error("INVALID_QUANTITY");
  }

  if (existing.medication.status !== "ACTIVE") {
    throw new Error("MEDICATION_INACTIVE");
  }

  const result = await prisma.$transaction(async (tx) => {
    const claimed = await tx.replenishmentRequest.updateMany({
      where: {
        id,
        status: "APPROVED",
      },
      data: {
        status: "RECEIVED",
        receivedQuantity: qty,
        reviewedByUserId: actorUserId,
        reviewedAt: new Date(),
      },
    });

    if (claimed.count === 0) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }

    const medication = await tx.medication.findUnique({
      where: { id: existing.medicationId },
    });

    if (!medication) {
      throw new Error("MEDICATION_NOT_FOUND");
    }

    if (medication.status !== "ACTIVE") {
      throw new Error("MEDICATION_INACTIVE");
    }

    const quantityBefore = medication.quantityOnHand;
    const quantityAfter = quantityBefore + qty;

    const stockUpdated = await tx.medication.updateMany({
      where: {
        id: medication.id,
        quantityOnHand: quantityBefore,
        status: "ACTIVE",
      },
      data: {
        quantityOnHand: quantityAfter,
      },
    });

    if (stockUpdated.count === 0) {
      throw new Error("CONCURRENT_STOCK_UPDATE");
    }

    await tx.stockMovement.create({
      data: {
        medicationId: medication.id,
        movementType: "REPLENISHMENT_RECEIVE",
        quantityDelta: qty,
        quantityBefore,
        quantityAfter,
        reason: `Replenishment ${existing.requestNo} received`,
        actorUserId,
        replenishmentRequestId: id,
      },
    });

    return tx.replenishmentRequest.findUniqueOrThrow({
      where: { id },
      include: detailInclude,
    });
  });

  await safeRecordAuditEvent({
    actorUserId,
    actorRole: role,
    action: "STATUS_CHANGE",
    entityType: "REPLENISHMENT_REQUEST",
    entityId: result.id,
    metadata: {
      requestNo: result.requestNo,
      from: "APPROVED",
      to: "RECEIVED",
      receivedQuantity: qty,
      medicationId: result.medicationId,
      sku: result.medication.sku,
    },
  });

  await safeRecordAuditEvent({
    actorUserId,
    actorRole: role,
    action: "UPDATE",
    entityType: "MEDICATION",
    entityId: result.medicationId,
    metadata: {
      sku: result.medication.sku,
      delta: qty,
      from: result.medication.quantityOnHand - qty,
      to: result.medication.quantityOnHand,
      replenishmentRequestId: result.id,
    },
  });

  return withMedicationStockStatus(result);
};
