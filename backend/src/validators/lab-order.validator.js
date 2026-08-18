"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLabTestOrderStatusSchema = exports.createLabTestOrderSchema = exports.labResultFlagEnum = exports.labTestOrderStatusEnum = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const zod_1 = require("zod");
exports.labTestOrderStatusEnum = zod_1.z.enum([
    "REQUESTED",
    "SAMPLE_COLLECTED",
    "PROCESSING",
    "RESULT_AVAILABLE",
    "ACKNOWLEDGED",
    "CANCELLED",
    "REJECTED",
]);
exports.labResultFlagEnum = zod_1.z.enum([
    "NORMAL",
    "ABNORMAL",
    "CRITICAL",
]);
exports.createLabTestOrderSchema = zod_1.z.object({
    patientId: zod_1.z.number().int().positive(),
    doctorId: zod_1.z.number().int().positive(),
    testName: zod_1.z.string().trim().min(1).max(200),
    appointmentId: zod_1.z.number().int().positive().optional(),
    notes: zod_1.z.string().max(1000).optional(),
    orderedAt: zod_1.z.string().datetime().optional(),
});
exports.updateLabTestOrderStatusSchema = zod_1.z
    .object({
    status: zod_1.z.enum([
        "SAMPLE_COLLECTED",
        "PROCESSING",
        "CANCELLED",
        "REJECTED",
    ]),
    rejectionReason: zod_1.z.string().min(3).max(500).optional(),
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
//# sourceMappingURL=lab-order.validator.js.map