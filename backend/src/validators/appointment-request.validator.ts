/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { z } from "zod";

export const appointmentRequestStatusEnum = z.enum([
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
]);

export const createAppointmentRequestSchema = z.object({
  doctorId: z.number().int().positive(),
  requestedAt: z.string().datetime(),
  duration: z.number().int().min(15).max(180).optional(),
  type: z.enum(["IN_PERSON", "VIDEO", "PHONE"]).optional(),
  reason: z.string().min(3).max(250),
  notes: z.string().max(500).optional(),
});

export const updateAppointmentRequestStatusSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED", "CANCELLED"]),
    rejectionReason: z.string().min(3).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === "REJECTED" &&
      !data.rejectionReason?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["rejectionReason"],
        message: "Rejection reason is required",
      });
    }
  });
