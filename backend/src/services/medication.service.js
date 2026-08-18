"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMedicationMovements = exports.adjustMedicationStock = exports.updateMedication = exports.createMedication = exports.getMedicationById = exports.listMedications = exports.deriveStockStatus = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const prisma_1 = require("../config/prisma");
const audit_service_1 = require("./audit.service");
const deriveStockStatus = (quantityOnHand, reorderLevel) => {
    if (quantityOnHand <= 0) {
        return "OUT_OF_STOCK";
    }
    if (quantityOnHand <= reorderLevel) {
        return "LOW_STOCK";
    }
    return "IN_STOCK";
};
exports.deriveStockStatus = deriveStockStatus;
const withStockStatus = (medication) => ({
    ...medication,
    stockStatus: (0, exports.deriveStockStatus)(medication.quantityOnHand, medication.reorderLevel),
});
const listMedications = async (filters) => {
    const where = {};
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
    const medications = await prisma_1.prisma.medication.findMany({
        where,
        orderBy: [{ name: "asc" }],
    });
    const withStatus = medications.map(withStockStatus);
    if (!filters.stockStatus) {
        return withStatus;
    }
    return withStatus.filter((item) => item.stockStatus === filters.stockStatus);
};
exports.listMedications = listMedications;
const getMedicationById = async (id) => {
    const medication = await prisma_1.prisma.medication.findUnique({
        where: { id },
    });
    if (!medication) {
        throw new Error("MEDICATION_NOT_FOUND");
    }
    return withStockStatus(medication);
};
exports.getMedicationById = getMedicationById;
const createMedication = async (data, auditContext) => {
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
    const existing = await prisma_1.prisma.medication.findUnique({
        where: { sku },
    });
    if (existing) {
        throw new Error("DUPLICATE_SKU");
    }
    const created = await prisma_1.prisma.medication.create({
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
        await prisma_1.prisma.stockMovement.create({
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
    await (0, audit_service_1.safeRecordAuditEvent)({
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
exports.createMedication = createMedication;
const updateMedication = async (id, data, auditContext) => {
    const existing = await prisma_1.prisma.medication.findUnique({
        where: { id },
    });
    if (!existing) {
        throw new Error("MEDICATION_NOT_FOUND");
    }
    if ((data.reorderLevel !== undefined && data.reorderLevel < 0) ||
        (data.reorderQuantity !== undefined && data.reorderQuantity < 0)) {
        throw new Error("INVALID_QUANTITY");
    }
    const updatedFields = [];
    const updateData = {};
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
    const updated = await prisma_1.prisma.medication.update({
        where: { id },
        data: updateData,
    });
    await (0, audit_service_1.safeRecordAuditEvent)({
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
exports.updateMedication = updateMedication;
const adjustMedicationStock = async (id, input, auditContext) => {
    const reason = input.reason.trim();
    if (!reason || reason.length < 3) {
        throw new Error("ADJUST_REASON_REQUIRED");
    }
    if (!Number.isInteger(input.delta) || input.delta === 0) {
        throw new Error("INVALID_DELTA");
    }
    const result = await prisma_1.prisma.$transaction(async (tx) => {
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
    await (0, audit_service_1.safeRecordAuditEvent)({
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
exports.adjustMedicationStock = adjustMedicationStock;
const listMedicationMovements = async (medicationId, pagination) => {
    const medication = await prisma_1.prisma.medication.findUnique({
        where: { id: medicationId },
        select: { id: true },
    });
    if (!medication) {
        throw new Error("MEDICATION_NOT_FOUND");
    }
    const where = { medicationId };
    const [total, data] = await Promise.all([
        prisma_1.prisma.stockMovement.count({ where }),
        prisma_1.prisma.stockMovement.findMany({
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
exports.listMedicationMovements = listMedicationMovements;
//# sourceMappingURL=medication.service.js.map