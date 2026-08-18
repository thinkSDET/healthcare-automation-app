import { z } from "zod";
export declare const labTestOrderStatusEnum: z.ZodEnum<{
    ACKNOWLEDGED: "ACKNOWLEDGED";
    CANCELLED: "CANCELLED";
    PROCESSING: "PROCESSING";
    REJECTED: "REJECTED";
    REQUESTED: "REQUESTED";
    RESULT_AVAILABLE: "RESULT_AVAILABLE";
    SAMPLE_COLLECTED: "SAMPLE_COLLECTED";
}>;
export declare const labResultFlagEnum: z.ZodEnum<{
    ABNORMAL: "ABNORMAL";
    CRITICAL: "CRITICAL";
    NORMAL: "NORMAL";
}>;
export declare const createLabTestOrderSchema: z.ZodObject<{
    patientId: z.ZodNumber;
    doctorId: z.ZodNumber;
    testName: z.ZodString;
    appointmentId: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    orderedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateLabTestOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        CANCELLED: "CANCELLED";
        PROCESSING: "PROCESSING";
        REJECTED: "REJECTED";
        SAMPLE_COLLECTED: "SAMPLE_COLLECTED";
    }>;
    rejectionReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=lab-order.validator.d.ts.map