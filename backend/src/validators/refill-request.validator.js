"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderFromRefillSchema = exports.updateRefillRequestStatusSchema = exports.createRefillRequestSchema = exports.refillRequestStatusEnum = exports.refillRequestTypeEnum = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const zod_1 = require("zod");
exports.refillRequestTypeEnum = zod_1.z.enum([
    "REFILL",
    "RENEWAL",
]);
exports.refillRequestStatusEnum = zod_1.z.enum([
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
    "FULFILLED",
]);
exports.createRefillRequestSchema = zod_1.z.object({
    requestType: exports.refillRequestTypeEnum,
    notes: zod_1.z.string().max(500).optional(),
});
exports.updateRefillRequestStatusSchema = zod_1.z
    .object({
    status: zod_1.z.enum([
        "APPROVED",
        "REJECTED",
        "CANCELLED",
    ]),
    rejectionReason: zod_1.z.string().min(3).max(500).optional(),
})
    .superRefine((data, ctx) => {
    if (data.status === "REJECTED" &&
        !data.rejectionReason?.trim()) {
        ctx.addIssue({
            code: "custom",
            path: ["rejectionReason"],
            message: "Rejection reason is required",
        });
    }
});
exports.createOrderFromRefillSchema = zod_1.z.object({
    deliveryAddress: zod_1.z.string().max(500).optional(),
    notes: zod_1.z.string().max(500).optional(),
    items: zod_1.z
        .array(zod_1.z.object({
        productName: zod_1.z.string().min(1).max(200),
        quantity: zod_1.z.number().int().positive(),
        unitPrice: zod_1.z.number().nonnegative(),
    }))
        .min(1),
});
//# sourceMappingURL=refill-request.validator.js.map