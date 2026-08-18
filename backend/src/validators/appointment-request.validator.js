"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentRequestStatusSchema = exports.createAppointmentRequestSchema = exports.appointmentRequestStatusEnum = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const zod_1 = require("zod");
exports.appointmentRequestStatusEnum = zod_1.z.enum([
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
]);
exports.createAppointmentRequestSchema = zod_1.z.object({
    doctorId: zod_1.z.number().int().positive(),
    requestedAt: zod_1.z.string().datetime(),
    duration: zod_1.z.number().int().min(15).max(180).optional(),
    type: zod_1.z.enum(["IN_PERSON", "VIDEO", "PHONE"]).optional(),
    reason: zod_1.z.string().min(3).max(250),
    notes: zod_1.z.string().max(500).optional(),
});
exports.updateAppointmentRequestStatusSchema = zod_1.z
    .object({
    status: zod_1.z.enum(["APPROVED", "REJECTED", "CANCELLED"]),
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
//# sourceMappingURL=appointment-request.validator.js.map