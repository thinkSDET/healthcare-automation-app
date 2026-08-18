import { z } from "zod";
export declare const replenishmentStatusEnum: z.ZodEnum<{
    APPROVED: "APPROVED";
    CANCELLED: "CANCELLED";
    RECEIVED: "RECEIVED";
    REJECTED: "REJECTED";
    SUBMITTED: "SUBMITTED";
}>;
export declare const createReplenishmentRequestSchema: z.ZodObject<{
    medicationId: z.ZodNumber;
    requestedQuantity: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateReplenishmentRequestStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        APPROVED: "APPROVED";
        CANCELLED: "CANCELLED";
        RECEIVED: "RECEIVED";
        REJECTED: "REJECTED";
    }>;
    rejectionReason: z.ZodOptional<z.ZodString>;
    receivedQuantity: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
//# sourceMappingURL=replenishment-request.validator.d.ts.map