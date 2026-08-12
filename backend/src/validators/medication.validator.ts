/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { z } from "zod";

export const medicationStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);

export const stockStatusEnum = z.enum([
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
]);

export const createMedicationSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  unit: z.string().min(1).max(50),
  quantityOnHand: z.number().int().min(0).optional(),
  reorderLevel: z.number().int().min(0).optional(),
  reorderQuantity: z.number().int().min(0).optional(),
  status: medicationStatusEnum.optional(),
});

export const updateMedicationSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    unit: z.string().min(1).max(50).optional(),
    reorderLevel: z.number().int().min(0).optional(),
    reorderQuantity: z.number().int().min(0).optional(),
    status: medicationStatusEnum.optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field is required" }
  );

export const adjustMedicationStockSchema = z.object({
  delta: z.number().int().refine((v) => v !== 0, {
    message: "Delta must be a non-zero integer",
  }),
  reason: z.string().min(3).max(500),
});
