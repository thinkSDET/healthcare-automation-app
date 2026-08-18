import { z } from "zod";
export declare const refillRequestTypeEnum: z.ZodEnum<{
    REFILL: "REFILL";
    RENEWAL: "RENEWAL";
}>;
export declare const refillRequestStatusEnum: z.ZodEnum<{
    APPROVED: "APPROVED";
    CANCELLED: "CANCELLED";
    FULFILLED: "FULFILLED";
    REJECTED: "REJECTED";
    SUBMITTED: "SUBMITTED";
}>;
export declare const createRefillRequestSchema: z.ZodObject<{
    requestType: z.ZodEnum<{
        REFILL: "REFILL";
        RENEWAL: "RENEWAL";
    }>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateRefillRequestStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        APPROVED: "APPROVED";
        CANCELLED: "CANCELLED";
        REJECTED: "REJECTED";
    }>;
    rejectionReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createOrderFromRefillSchema: z.ZodObject<{
    deliveryAddress: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        productName: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
//# sourceMappingURL=refill-request.validator.d.ts.map