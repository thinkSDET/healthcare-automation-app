"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustMedicationStockSchema = exports.updateMedicationSchema = exports.createMedicationSchema = exports.stockStatusEnum = exports.medicationStatusEnum = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const zod_1 = require("zod");
exports.medicationStatusEnum = zod_1.z.enum(["ACTIVE", "INACTIVE"]);
exports.stockStatusEnum = zod_1.z.enum([
    "IN_STOCK",
    "LOW_STOCK",
    "OUT_OF_STOCK",
]);
exports.createMedicationSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1).max(50),
    name: zod_1.z.string().min(1).max(200),
    unit: zod_1.z.string().min(1).max(50),
    quantityOnHand: zod_1.z.number().int().min(0).optional(),
    reorderLevel: zod_1.z.number().int().min(0).optional(),
    reorderQuantity: zod_1.z.number().int().min(0).optional(),
    status: exports.medicationStatusEnum.optional(),
});
exports.updateMedicationSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1).max(200).optional(),
    unit: zod_1.z.string().min(1).max(50).optional(),
    reorderLevel: zod_1.z.number().int().min(0).optional(),
    reorderQuantity: zod_1.z.number().int().min(0).optional(),
    status: exports.medicationStatusEnum.optional(),
})
    .refine((data) => Object.keys(data).length > 0, { message: "At least one field is required" });
exports.adjustMedicationStockSchema = zod_1.z.object({
    delta: zod_1.z.number().int().refine((v) => v !== 0, {
        message: "Delta must be a non-zero integer",
    }),
    reason: zod_1.z.string().min(3).max(500),
});
//# sourceMappingURL=medication.validator.js.map