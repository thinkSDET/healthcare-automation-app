import { z } from "zod";
export declare const createUserSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    passwordHash: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<{
        ADMIN: "ADMIN";
        DOCTOR: "DOCTOR";
        PHARMACIST: "PHARMACIST";
        SUPPORT: "SUPPORT";
        VIEWER: "VIEWER";
    }>>;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<{
        ADMIN: "ADMIN";
        DOCTOR: "DOCTOR";
        PHARMACIST: "PHARMACIST";
        SUPPORT: "SUPPORT";
        VIEWER: "VIEWER";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        LOCKED: "LOCKED";
    }>>;
}, z.core.$strip>;
//# sourceMappingURL=user.validator.d.ts.map