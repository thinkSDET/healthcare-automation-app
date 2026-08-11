import { z } from "zod";
export declare const createDoctorSchema: z.ZodObject<{
    doctorCode: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    specialization: z.ZodString;
    licenseNumber: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    experience: z.ZodNumber;
}, z.core.$strip>;
export declare const updateDoctorSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    experience: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        ON_LEAVE: "ON_LEAVE";
    }>>;
}, z.core.$strip>;
//# sourceMappingURL=doctor.validator.d.ts.map