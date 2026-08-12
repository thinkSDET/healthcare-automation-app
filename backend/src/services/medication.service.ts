/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { prisma } from "../config/prisma";
import {
  safeRecordAuditEvent,
  type AuditContext,
} from "./audit.service";

export type MedicationStatusValue = "ACTIVE" | "INACTIVE";
export type StockStatusValue = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export const deriveStockStatus = (
  quantityOnHand: number,
  reorderLevel: number
): StockStatusValue => {
  if (quantityOnHand <= 0) {
    return "OUT_OF_STOCK";
  }
  if (quantityOnHand <= reorderLevel) {
    return "LOW_STOCK";
  }
  return "IN_STOCK";
};

const withStockStatus = <
  T extends { quantityOnHand: number; reorderLevel: number }
>(
  medication: T
) => ({
  ...medication,
  stockStatus: deriveStockStatus(
    medication.quantityOnHand,
    medication.reorderLevel
  ),
});

export const listMedications = async (filters: {
  status?: MedicationStatusValue;
  stockStatus?: StockStatusValue;
  q?: string;
}) => {
  const where: Record<string, unknown> = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }

  const medications = await prisma.medication.findMany({
    where,
    orderBy: [{ name: "asc" }],
  });

  const withStatus = medications.map(withStockStatus);

  if (!filters.stockStatus) {
    return withStatus;
  }

  return withStatus.filter(
    (item) => item.stockStatus === filters.stockStatus
  );
};

export const getMedicationById = async (id: number) => {
  const medication = await prisma.medication.findUnique({
    where: { id },
  });

  if (!medication) {
    throw new Error("MEDICATION_NOT_FOUND");
  }

  return withStockStatus(medication);
};

export const createMedication = async (
  data: {
    sku: string;
    name: string;
    unit: string;
    quantityOnHand?: number;
    reorderLevel?: number;
    reorderQuantity?: number;
    status?: MedicationStatusValue;
  },
  auditContext: AuditContext
) => {
  const quantityOnHand = data.quantityOnHand ?? 0;
  const reorderLevel = data.reorderLevel ?? 0;
  const reorderQuantity = data.reorderQuantity ?? 0;

  if (quantityOnHand < 0 || reorderLevel < 0 || reorderQuantity < 0) {
    throw new Error("INVALID_QUANTITY");
  }

  const sku = data.sku.trim().toUpperCase();
  const name = data.name.trim();
  const unit = data.unit.trim();

  if (!sku || !name || !unit) {
    throw new Error("INVALID_MEDICATION_FIELDS");
  }

  const existing = await prisma.medication.findUnique({
    where: { sku },
  });

  if (existing) {
    throw new Error("DUPLICATE_SKU");
  }

  const created = await prisma.medication.create({
    data: {
      sku,
      name,
      unit,
      quantityOnHand,
      reorderLevel,
      reorderQuantity,
      status: data.status || "ACTIVE",
    },
  });

  if (quantityOnHand > 0) {
    await prisma.stockMovement.create({
      data: {
        medicationId: created.id,
        movementType: "ADJUSTMENT",
        quantityDelta: quantityOnHand,
        quantityBefore: 0,
        quantityAfter: quantityOnHand,
        reason: "Initial stock on catalog create",
        actorUserId: auditContext.actorUserId,
      },
    });
  }

  await safeRecordAuditEvent({
    actorUserId: auditContext.actorUserId,
    actorRole: auditContext.actorRole,
    action: "CREATE",
    entityType: "MEDICATION",
    entityId: created.id,
    metadata: {
      sku: created.sku,
      quantityOnHand: created.quantityOnHand,
    },
  });

  return withStockStatus(created);
};

export const updateMedication = async (
  id: number,
  data: {
    name?: string;
    unit?: string;
    reorderLevel?: number;
    reorderQuantity?: number;
    status?: MedicationStatusValue;
  },
  auditContext: AuditContext
) => {
  const existing = await prisma.medication.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("MEDICATION_NOT_FOUND");
  }

  if (
    (data.reorderLevel !== undefined && data.reorderLevel < 0) ||
    (data.reorderQuantity !== undefined && data.reorderQuantity < 0)
  ) {
    throw new Error("INVALID_QUANTITY");
  }

  const updatedFields: string[] = [];
  const updateData: {
    name?: string;
    unit?: string;
    reorderLevel?: number;
    reorderQuantity?: number;
    status?: MedicationStatusValue;
  } = {};

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) {
      throw new Error("INVALID_MEDICATION_FIELDS");
    }
    updateData.name = name;
    updatedFields.push("name");
  }
  if (data.unit !== undefined) {
    const unit = data.unit.trim();
    if (!unit) {
      throw new Error("INVALID_MEDICATION_FIELDS");
    }
    updateData.unit = unit;
    updatedFields.push("unit");
  }
  if (data.reorderLevel !== undefined) {
    updateData.reorderLevel = data.reorderLevel;
    updatedFields.push("reorderLevel");
  }
  if (data.reorderQuantity !== undefined) {
    updateData.reorderQuantity = data.reorderQuantity;
    updatedFields.push("reorderQuantity");
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
    updatedFields.push("status");
  }

  const updated = await prisma.medication.update({
    where: { id },
    data: updateData,
  });

  await safeRecordAuditEvent({
    actorUserId: auditContext.actorUserId,
    actorRole: auditContext.actorRole,
    action: "UPDATE",
    entityType: "MEDICATION",
    entityId: updated.id,
    metadata: {
      sku: updated.sku,
      updatedFields,
    },
  });

  return withStockStatus(updated);
};

export const adjustMedicationStock = async (
  id: number,
  input: {
    delta: number;
    reason: string;
  },
  auditContext: AuditContext
) => {
  const reason = input.reason.trim();
  if (!reason || reason.length < 3) {
    throw new Error("ADJUST_REASON_REQUIRED");
  }

  if (!Number.isInteger(input.delta) || input.delta === 0) {
    throw new Error("INVALID_DELTA");
  }

  const result = await prisma.$transaction(async (tx) => {
    const medication = await tx.medication.findUnique({
      where: { id },
    });

    if (!medication) {
      throw new Error("MEDICATION_NOT_FOUND");
    }

    if (medication.status !== "ACTIVE") {
      throw new Error("MEDICATION_INACTIVE");
    }

    const quantityBefore = medication.quantityOnHand;
    const quantityAfter = quantityBefore + input.delta;

    if (quantityAfter < 0) {
      throw new Error("NEGATIVE_STOCK");
    }

    const updated = await tx.medication.updateMany({
      where: {
        id,
        quantityOnHand: quantityBefore,
        status: "ACTIVE",
      },
      data: {
        quantityOnHand: quantityAfter,
      },
    });

    if (updated.count === 0) {
      throw new Error("CONCURRENT_STOCK_UPDATE");
    }

    const movement = await tx.stockMovement.create({
      data: {
        medicationId: id,
        movementType: "ADJUSTMENT",
        quantityDelta: input.delta,
        quantityBefore,
        quantityAfter,
        reason,
        actorUserId: auditContext.actorUserId,
      },
    });

    const refreshed = await tx.medication.findUniqueOrThrow({
      where: { id },
    });

    return { medication: refreshed, movement };
  });

  await safeRecordAuditEvent({
    actorUserId: auditContext.actorUserId,
    actorRole: auditContext.actorRole,
    action: "UPDATE",
    entityType: "MEDICATION",
    entityId: result.medication.id,
    metadata: {
      sku: result.medication.sku,
      from: result.movement.quantityBefore,
      to: result.movement.quantityAfter,
      delta: result.movement.quantityDelta,
      movementId: result.movement.id,
    },
  });

  return {
    medication: withStockStatus(result.medication),
    movement: result.movement,
  };
};

export const listMedicationMovements = async (
  medicationId: number,
  pagination: { limit: number; offset: number }
) => {
  const medication = await prisma.medication.findUnique({
    where: { id: medicationId },
    select: { id: true },
  });

  if (!medication) {
    throw new Error("MEDICATION_NOT_FOUND");
  }

  const where = { medicationId };

  const [total, data] = await Promise.all([
    prisma.stockMovement.count({ where }),
    prisma.stockMovement.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        replenishmentRequest: {
          select: {
            id: true,
            requestNo: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: pagination.limit,
      skip: pagination.offset,
    }),
  ]);

  return {
    data,
    meta: {
      limit: pagination.limit,
      offset: pagination.offset,
      total,
    },
  };
};
