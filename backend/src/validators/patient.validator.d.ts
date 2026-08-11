import { z } from "zod";
export declare const createPatientSchema: z.ZodObject<{
    medicalId: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    dateOfBirth: z.ZodUnion<readonly [z.ZodString, z.ZodString]>;
    gender: z.ZodEnum<{
        FEMALE: "FEMALE";
        MALE: "MALE";
        OTHER: "OTHER";
    }>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
    bloodGroup: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updatePatientSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    bloodGroup: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        DECEASED: "DECEASED";
        INACTIVE: "INACTIVE";
    }>>;
}, z.core.$strip>;
//# sourceMappingURL=patient.validator.d.ts.map