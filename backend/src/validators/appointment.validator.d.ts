import { z } from "zod";
export declare const appointmentStatusEnum: z.ZodEnum<{
    CANCELLED: "CANCELLED";
    CHECKED_IN: "CHECKED_IN";
    COMPLETED: "COMPLETED";
    CONFIRMED: "CONFIRMED";
    IN_CONSULTATION: "IN_CONSULTATION";
    NO_SHOW: "NO_SHOW";
    SCHEDULED: "SCHEDULED";
}>;
export declare const createAppointmentSchema: z.ZodObject<{
    appointmentNo: z.ZodString;
    patientId: z.ZodNumber;
    doctorId: z.ZodNumber;
    appointmentAt: z.ZodString;
    duration: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<{
        IN_PERSON: "IN_PERSON";
        PHONE: "PHONE";
        VIDEO: "VIDEO";
    }>>;
    reason: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateAppointmentSchema: z.ZodObject<{
    appointmentAt: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<{
        IN_PERSON: "IN_PERSON";
        PHONE: "PHONE";
        VIDEO: "VIDEO";
    }>>;
    reason: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateAppointmentStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        CANCELLED: "CANCELLED";
        CHECKED_IN: "CHECKED_IN";
        COMPLETED: "COMPLETED";
        CONFIRMED: "CONFIRMED";
        IN_CONSULTATION: "IN_CONSULTATION";
        NO_SHOW: "NO_SHOW";
        SCHEDULED: "SCHEDULED";
    }>;
}, z.core.$strip>;
//# sourceMappingURL=appointment.validator.d.ts.map