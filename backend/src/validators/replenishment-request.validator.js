"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReplenishmentRequestStatusSchema = exports.createReplenishmentRequestSchema = exports.replenishmentStatusEnum = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const zod_1 = require("zod");
exports.replenishmentStatusEnum = zod_1.z.enum([
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
    "RECEIVED",
]);
exports.createReplenishmentRequestSchema = zod_1.z.object({
    medicationId: zod_1.z.number().int().positive(),
    requestedQuantity: zod_1.z.number().int().positive(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.updateReplenishmentRequestStatusSchema = zod_1.z
    .object({
    status: zod_1.z.enum(["APPROVED", "REJECTED", "CANCELLED", "RECEIVED"]),
    rejectionReason: zod_1.z.string().min(3).max(500).optional(),
    receivedQuantity: zod_1.z.number().int().positive().optional(),
})
    .superRefine((data, ctx) => {
    if (data.status === "REJECTED" && !data.rejectionReason?.trim()) {
        ctx.addIssue({
            code: "custom",
            path: ["rejectionReason"],
            message: "Rejection reason is required",
        });
    }
});
//# sourceMappingURL=replenishment-request.validator.js.map