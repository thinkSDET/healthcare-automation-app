/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { z } from "zod";

export const refillRequestTypeEnum = z.enum([
  "REFILL",
  "RENEWAL",
]);

export const refillRequestStatusEnum = z.enum([
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "FULFILLED",
]);

export const createRefillRequestSchema = z.object({
  requestType: refillRequestTypeEnum,
  notes: z.string().max(500).optional(),
});

export const updateRefillRequestStatusSchema = z
  .object({
    status: z.enum([
      "APPROVED",
      "REJECTED",
      "CANCELLED",
    ]),
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

export const createOrderFromRefillSchema = z.object({
  deliveryAddress: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        productName: z.string().min(1).max(200),
        quantity: z.number().int().positive(),
        unitPrice: z.number().nonnegative(),
      })
    )
    .min(1),
});
