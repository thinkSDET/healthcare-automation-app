import { z } from "zod";
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
    status: z.ZodOptional<z.ZodEnum<{
        CANCELLED: "CANCELLED";
        COMPLETED: "COMPLETED";
        CONFIRMED: "CONFIRMED";
        NO_SHOW: "NO_SHOW";
        SCHEDULED: "SCHEDULED";
    }>>;
    reason: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=appointment.validator.d.ts.map