import { z } from "zod";

export const replenishmentStatusEnum = z.enum([
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
  "RECEIVED",
]);

export const createReplenishmentRequestSchema = z.object({
  medicationId: z.number().int().positive(),
  requestedQuantity: z.number().int().positive(),
  notes: z.string().max(500).optional(),
});

export const updateReplenishmentRequestStatusSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED", "CANCELLED", "RECEIVED"]),
    rejectionReason: z.string().min(3).max(500).optional(),
    receivedQuantity: z.number().int().positive().optional(),
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
