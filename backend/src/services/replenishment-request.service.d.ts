export type ReplenishmentStatusValue = "SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED" | "RECEIVED";
export declare const createReplenishmentRequest: (input: {
    medicationId: number;
    requestedQuantity: number;
    notes?: string;
    requestedByUserId: number;
    role: string;
}) => Promise<{
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
    };
    requestedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    };
    reviewedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
} & {
    id: number;
    requestNo: string;
    medicationId: number;
    requestedQuantity: number;
    status: import("../generated/prisma/enums").ReplenishmentRequestStatus;
    requestedByUserId: number;
    reviewedByUserId: number | null;
    rejectionReason: string | null;
    notes: string | null;
    receivedQuantity: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
} & {
    medication: {
        quantityOnHand: number;
        reorderLevel: number;
        stockStatus: import("./medication.service").StockStatusValue;
    };
}>;
export declare const listReplenishmentRequests: (filters: {
    status?: ReplenishmentStatusValue;
    medicationId?: number;
}) => Promise<({
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
    };
    requestedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    };
    reviewedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
} & {
    id: number;
    requestNo: string;
    medicationId: number;
    requestedQuantity: number;
    status: import("../generated/prisma/enums").ReplenishmentRequestStatus;
    requestedByUserId: number;
    reviewedByUserId: number | null;
    rejectionReason: string | null;
    notes: string | null;
    receivedQuantity: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
} & {
    medication: {
        quantityOnHand: number;
        reorderLevel: number;
        stockStatus: import("./medication.service").StockStatusValue;
    };
})[]>;
export declare const getReplenishmentRequestById: (id: number) => Promise<{
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
    };
    requestedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    };
    reviewedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
} & {
    id: number;
    requestNo: string;
    medicationId: number;
    requestedQuantity: number;
    status: import("../generated/prisma/enums").ReplenishmentRequestStatus;
    requestedByUserId: number;
    reviewedByUserId: number | null;
    rejectionReason: string | null;
    notes: string | null;
    receivedQuantity: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
} & {
    medication: {
        quantityOnHand: number;
        reorderLevel: number;
        stockStatus: import("./medication.service").StockStatusValue;
    };
}>;
export declare const updateReplenishmentRequestStatus: (input: {
    id: number;
    nextStatus: "APPROVED" | "REJECTED" | "CANCELLED" | "RECEIVED";
    rejectionReason?: string;
    receivedQuantity?: number;
    actorUserId: number;
    role: string;
}) => Promise<{
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
    };
    requestedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    };
    reviewedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
} & {
    id: number;
    requestNo: string;
    medicationId: number;
    requestedQuantity: number;
    status: import("../generated/prisma/enums").ReplenishmentRequestStatus;
    requestedByUserId: number;
    reviewedByUserId: number | null;
    rejectionReason: string | null;
    notes: string | null;
    receivedQuantity: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
} & {
    medication: {
        quantityOnHand: number;
        reorderLevel: number;
        stockStatus: import("./medication.service").StockStatusValue;
    };
}>;
//# sourceMappingURL=replenishment-request.service.d.ts.map