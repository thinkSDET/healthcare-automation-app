export type RefillRequestTypeValue = "REFILL" | "RENEWAL";
export type RefillRequestStatusValue = "SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED" | "FULFILLED";
export declare const createRefillRequest: (input: {
    prescriptionId: number;
    requestType: RefillRequestTypeValue;
    notes?: string;
    requestedByUserId: number;
    role: string;
}) => Promise<{
    order: {
        id: number;
        orderNo: string;
        paymentStatus: import("../generated/prisma/enums").PaymentStatus;
        status: import("../generated/prisma/enums").OrderStatus;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
    } | null;
    patient: {
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
        status: import("../generated/prisma/enums").PatientStatus;
        userId: number | null;
    };
    prescription: {
        doctor: {
            doctorCode: string;
            firstName: string;
            id: number;
            lastName: string;
            specialization: string;
        };
        items: {
            id: number;
            prescriptionId: number;
            medicineName: string;
            dosage: string;
            frequency: string;
            duration: string;
            route: string | null;
            instructions: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: number;
        prescriptionNo: string;
        patientId: number;
        doctorId: number;
        prescribedAt: Date;
        diagnosis: string | null;
        notes: string | null;
        status: import("../generated/prisma/enums").PrescriptionStatus;
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
    prescriptionId: number;
    patientId: number;
    requestType: import("../generated/prisma/enums").RefillRequestType;
    status: import("../generated/prisma/enums").RefillRequestStatus;
    requestedByUserId: number;
    reviewedByUserId: number | null;
    rejectionReason: string | null;
    notes: string | null;
    orderId: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const listRefillRequests: (filters: {
    role: string;
    userId: number;
    ownPatientId: number | null;
    status?: RefillRequestStatusValue;
    patientId?: number;
    requestType?: RefillRequestTypeValue;
}) => Promise<({
    order: {
        id: number;
        orderNo: string;
        paymentStatus: import("../generated/prisma/enums").PaymentStatus;
        status: import("../generated/prisma/enums").OrderStatus;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
    } | null;
    patient: {
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
        status: import("../generated/prisma/enums").PatientStatus;
        userId: number | null;
    };
    prescription: {
        doctor: {
            doctorCode: string;
            firstName: string;
            id: number;
            lastName: string;
            specialization: string;
        };
        items: {
            id: number;
            prescriptionId: number;
            medicineName: string;
            dosage: string;
            frequency: string;
            duration: string;
            route: string | null;
            instructions: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: number;
        prescriptionNo: string;
        patientId: number;
        doctorId: number;
        prescribedAt: Date;
        diagnosis: string | null;
        notes: string | null;
        status: import("../generated/prisma/enums").PrescriptionStatus;
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
    prescriptionId: number;
    patientId: number;
    requestType: import("../generated/prisma/enums").RefillRequestType;
    status: import("../generated/prisma/enums").RefillRequestStatus;
    requestedByUserId: number;
    reviewedByUserId: number | null;
    rejectionReason: string | null;
    notes: string | null;
    orderId: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare const getRefillRequestById: (id: number, access: {
    role: string;
    userId: number;
    ownPatientId: number | null;
}) => Promise<{
    order: {
        id: number;
        orderNo: string;
        paymentStatus: import("../generated/prisma/enums").PaymentStatus;
        status: import("../generated/prisma/enums").OrderStatus;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
    } | null;
    patient: {
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
        status: import("../generated/prisma/enums").PatientStatus;
        userId: number | null;
    };
    prescription: {
        doctor: {
            doctorCode: string;
            firstName: string;
            id: number;
            lastName: string;
            specialization: string;
        };
        items: {
            id: number;
            prescriptionId: number;
            medicineName: string;
            dosage: string;
            frequency: string;
            duration: string;
            route: string | null;
            instructions: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: number;
        prescriptionNo: string;
        patientId: number;
        doctorId: number;
        prescribedAt: Date;
        diagnosis: string | null;
        notes: string | null;
        status: import("../generated/prisma/enums").PrescriptionStatus;
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
    prescriptionId: number;
    patientId: number;
    requestType: import("../generated/prisma/enums").RefillRequestType;
    status: import("../generated/prisma/enums").RefillRequestStatus;
    requestedByUserId: number;
    reviewedByUserId: number | null;
    rejectionReason: string | null;
    notes: string | null;
    orderId: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateRefillRequestStatus: (input: {
    id: number;
    nextStatus: "APPROVED" | "REJECTED" | "CANCELLED";
    rejectionReason?: string;
    actorUserId: number;
    role: string;
}) => Promise<{
    order: {
        id: number;
        orderNo: string;
        paymentStatus: import("../generated/prisma/enums").PaymentStatus;
        status: import("../generated/prisma/enums").OrderStatus;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
    } | null;
    patient: {
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
        status: import("../generated/prisma/enums").PatientStatus;
        userId: number | null;
    };
    prescription: {
        doctor: {
            doctorCode: string;
            firstName: string;
            id: number;
            lastName: string;
            specialization: string;
        };
        items: {
            id: number;
            prescriptionId: number;
            medicineName: string;
            dosage: string;
            frequency: string;
            duration: string;
            route: string | null;
            instructions: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: number;
        prescriptionNo: string;
        patientId: number;
        doctorId: number;
        prescribedAt: Date;
        diagnosis: string | null;
        notes: string | null;
        status: import("../generated/prisma/enums").PrescriptionStatus;
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
    prescriptionId: number;
    patientId: number;
    requestType: import("../generated/prisma/enums").RefillRequestType;
    status: import("../generated/prisma/enums").RefillRequestStatus;
    requestedByUserId: number;
    reviewedByUserId: number | null;
    rejectionReason: string | null;
    notes: string | null;
    orderId: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const createOrderFromRefillRequest: (input: {
    id: number;
    actorUserId: number;
    role: string;
    ownPatientId: number | null;
    deliveryAddress?: string;
    notes?: string;
    items: Array<{
        productName: string;
        quantity: number;
        unitPrice: number;
    }>;
}) => Promise<{
    order: {
        id: number;
        orderNo: string;
        paymentStatus: import("../generated/prisma/enums").PaymentStatus;
        status: import("../generated/prisma/enums").OrderStatus;
        totalAmount: import("@prisma/client-runtime-utils").Decimal;
    } | null;
    patient: {
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
        status: import("../generated/prisma/enums").PatientStatus;
        userId: number | null;
    };
    prescription: {
        doctor: {
            doctorCode: string;
            firstName: string;
            id: number;
            lastName: string;
            specialization: string;
        };
        items: {
            id: number;
            prescriptionId: number;
            medicineName: string;
            dosage: string;
            frequency: string;
            duration: string;
            route: string | null;
            instructions: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: number;
        prescriptionNo: string;
        patientId: number;
        doctorId: number;
        prescribedAt: Date;
        diagnosis: string | null;
        notes: string | null;
        status: import("../generated/prisma/enums").PrescriptionStatus;
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
    prescriptionId: number;
    patientId: number;
    requestType: import("../generated/prisma/enums").RefillRequestType;
    status: import("../generated/prisma/enums").RefillRequestStatus;
    requestedByUserId: number;
    reviewedByUserId: number | null;
    rejectionReason: string | null;
    notes: string | null;
    orderId: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=refill-request.service.d.ts.map