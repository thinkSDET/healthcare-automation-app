import { z } from "zod";
export declare const appointmentRequestStatusEnum: z.ZodEnum<{
    APPROVED: "APPROVED";
    CANCELLED: "CANCELLED";
    REJECTED: "REJECTED";
    SUBMITTED: "SUBMITTED";
}>;
export declare const createAppointmentRequestSchema: z.ZodObject<{
    doctorId: z.ZodNumber;
    requestedAt: z.ZodString;
    duration: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<{
        IN_PERSON: "IN_PERSON";
        PHONE: "PHONE";
        VIDEO: "VIDEO";
    }>>;
    reason: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateAppointmentRequestStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        APPROVED: "APPROVED";
        CANCELLED: "CANCELLED";
        REJECTED: "REJECTED";
    }>;
    rejectionReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=appointment-request.validator.d.ts.map