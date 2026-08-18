import { z } from "zod";
export declare const medicationStatusEnum: z.ZodEnum<{
    ACTIVE: "ACTIVE";
    INACTIVE: "INACTIVE";
}>;
export declare const stockStatusEnum: z.ZodEnum<{
    IN_STOCK: "IN_STOCK";
    LOW_STOCK: "LOW_STOCK";
    OUT_OF_STOCK: "OUT_OF_STOCK";
}>;
export declare const createMedicationSchema: z.ZodObject<{
    sku: z.ZodString;
    name: z.ZodString;
    unit: z.ZodString;
    quantityOnHand: z.ZodOptional<z.ZodNumber>;
    reorderLevel: z.ZodOptional<z.ZodNumber>;
    reorderQuantity: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
    }>>;
}, z.core.$strip>;
export declare const updateMedicationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    unit: z.ZodOptional<z.ZodString>;
    reorderLevel: z.ZodOptional<z.ZodNumber>;
    reorderQuantity: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
    }>>;
}, z.core.$strip>;
export declare const adjustMedicationStockSchema: z.ZodObject<{
    delta: z.ZodNumber;
    reason: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=medication.validator.d.ts.map