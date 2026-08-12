import { z } from "zod";

export const labTestOrderStatusEnum = z.enum([
  "REQUESTED",
  "SAMPLE_COLLECTED",
  "PROCESSING",
  "RESULT_AVAILABLE",
  "ACKNOWLEDGED",
  "CANCELLED",
  "REJECTED",
]);

export const labResultFlagEnum = z.enum([
  "NORMAL",
  "ABNORMAL",
  "CRITICAL",
]);

export const createLabTestOrderSchema = z.object({
  patientId: z.number().int().positive(),
  doctorId: z.number().int().positive(),
  testName: z.string().trim().min(1).max(200),
  appointmentId: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
  orderedAt: z.string().datetime().optional(),
});

export const updateLabTestOrderStatusSchema = z
  .object({
    status: z.enum([
      "SAMPLE_COLLECTED",
      "PROCESSING",
      "CANCELLED",
      "REJECTED",
    ]),
    rejectionReason: z.string().min(3).max(500).optional(),
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
