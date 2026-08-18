import { type AuditContext } from "./audit.service";
export type MedicationStatusValue = "ACTIVE" | "INACTIVE";
export type StockStatusValue = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
export declare const deriveStockStatus: (quantityOnHand: number, reorderLevel: number) => StockStatusValue;
export declare const listMedications: (filters: {
    status?: MedicationStatusValue;
    stockStatus?: StockStatusValue;
    q?: string;
}) => Promise<({
    id: number;
    sku: string;
    name: string;
    unit: string;
    quantityOnHand: number;
    reorderLevel: number;
    reorderQuantity: number;
    status: import("../generated/prisma/enums").MedicationStatus;
    createdAt: Date;
    updatedAt: Date;
} & {
    stockStatus: StockStatusValue;
})[]>;
export declare const getMedicationById: (id: number) => Promise<{
    id: number;
    sku: string;
    name: string;
    unit: string;
    quantityOnHand: number;
    reorderLevel: number;
    reorderQuantity: number;
    status: import("../generated/prisma/enums").MedicationStatus;
    createdAt: Date;
    updatedAt: Date;
} & {
    stockStatus: StockStatusValue;
}>;
export declare const createMedication: (data: {
    sku: string;
    name: string;
    unit: string;
    quantityOnHand?: number;
    reorderLevel?: number;
    reorderQuantity?: number;
    status?: MedicationStatusValue;
}, auditContext: AuditContext) => Promise<{
    id: number;
    sku: string;
    name: string;
    unit: string;
    quantityOnHand: number;
    reorderLevel: number;
    reorderQuantity: number;
    status: import("../generated/prisma/enums").MedicationStatus;
    createdAt: Date;
    updatedAt: Date;
} & {
    stockStatus: StockStatusValue;
}>;
export declare const updateMedication: (id: number, data: {
    name?: string;
    unit?: string;
    reorderLevel?: number;
    reorderQuantity?: number;
    status?: MedicationStatusValue;
}, auditContext: AuditContext) => Promise<{
    id: number;
    sku: string;
    name: string;
    unit: string;
    quantityOnHand: number;
    reorderLevel: number;
    reorderQuantity: number;
    status: import("../generated/prisma/enums").MedicationStatus;
    createdAt: Date;
    updatedAt: Date;
} & {
    stockStatus: StockStatusValue;
}>;
export declare const adjustMedicationStock: (id: number, input: {
    delta: number;
    reason: string;
}, auditContext: AuditContext) => Promise<{
    medication: {
        id: number;
        sku: string;
        name: string;
        unit: string;
        quantityOnHand: number;
        reorderLevel: number;
        reorderQuantity: number;
        status: import("../generated/prisma/enums").MedicationStatus;
        createdAt: Date;
        updatedAt: Date;
    } & {
        stockStatus: StockStatusValue;
    };
    movement: {
        id: number;
        medicationId: number;
        movementType: string;
        quantityDelta: number;
        quantityBefore: number;
        quantityAfter: number;
        reason: string | null;
        actorUserId: number;
        replenishmentRequestId: number | null;
        createdAt: Date;
    };
}>;
export declare const listMedicationMovements: (medicationId: number, pagination: {
    limit: number;
    offset: number;
}) => Promise<{
    data: ({
        actor: {
            firstName: string;
            id: number;
            lastName: string;
            role: import("../generated/prisma/enums").UserRole;
        };
        replenishmentRequest: {
            id: number;
            requestNo: string;
        } | null;
    } & {
        id: number;
        medicationId: number;
        movementType: string;
        quantityDelta: number;
        quantityBefore: number;
        quantityAfter: number;
        reason: string | null;
        actorUserId: number;
        replenishmentRequestId: number | null;
        createdAt: Date;
    })[];
    meta: {
        limit: number;
        offset: number;
        total: number;
    };
}>;
//# sourceMappingURL=medication.service.d.ts.map