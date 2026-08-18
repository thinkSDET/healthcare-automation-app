import { type AuditContext } from "./audit.service";
interface OrderItemInput {
    productName: string;
    quantity: number;
    unitPrice: number;
}
interface CreateOrderInput {
    patientId: number;
    orderDate?: string;
    status?: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    deliveryAddress?: string;
    notes?: string;
    items: OrderItemInput[];
}
export declare const getPatientOrders: (patientId: number) => Promise<({
    items: {
        id: number;
        orderId: number;
        productName: string;
        quantity: number;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
    }[];
} & {
    id: number;
    orderNo: string;
    patientId: number;
    orderDate: Date;
    status: import("../generated/prisma/enums").OrderStatus;
    paymentStatus: import("../generated/prisma/enums").PaymentStatus;
    totalAmount: import("@prisma/client-runtime-utils").Decimal;
    deliveryAddress: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare const getOrderById: (orderId: number) => Promise<{
    items: {
        id: number;
        orderId: number;
        productName: string;
        quantity: number;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
    }[];
    patient: {
        email: string | null;
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
        phone: string;
    };
} & {
    id: number;
    orderNo: string;
    patientId: number;
    orderDate: Date;
    status: import("../generated/prisma/enums").OrderStatus;
    paymentStatus: import("../generated/prisma/enums").PaymentStatus;
    totalAmount: import("@prisma/client-runtime-utils").Decimal;
    deliveryAddress: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getOrderByOrderNo: (orderNo: string) => Promise<{
    items: {
        id: number;
        orderId: number;
        productName: string;
        quantity: number;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
    }[];
    patient: {
        email: string | null;
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
        phone: string;
    };
} & {
    id: number;
    orderNo: string;
    patientId: number;
    orderDate: Date;
    status: import("../generated/prisma/enums").OrderStatus;
    paymentStatus: import("../generated/prisma/enums").PaymentStatus;
    totalAmount: import("@prisma/client-runtime-utils").Decimal;
    deliveryAddress: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * Resolve GET /api/orders/:id identifier.
 * - Digits within Prisma Int range → internal Order.id
 * - Otherwise → public orderNo (e.g. ORD-...)
 */
export declare const getOrderByIdentifier: (identifier: string) => Promise<{
    items: {
        id: number;
        orderId: number;
        productName: string;
        quantity: number;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
    }[];
    patient: {
        email: string | null;
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
        phone: string;
    };
} & {
    id: number;
    orderNo: string;
    patientId: number;
    orderDate: Date;
    status: import("../generated/prisma/enums").OrderStatus;
    paymentStatus: import("../generated/prisma/enums").PaymentStatus;
    totalAmount: import("@prisma/client-runtime-utils").Decimal;
    deliveryAddress: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const createOrder: (data: CreateOrderInput, auditContext?: AuditContext) => Promise<{
    items: {
        id: number;
        orderId: number;
        productName: string;
        quantity: number;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
    }[];
    patient: {
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
    };
} & {
    id: number;
    orderNo: string;
    patientId: number;
    orderDate: Date;
    status: import("../generated/prisma/enums").OrderStatus;
    paymentStatus: import("../generated/prisma/enums").PaymentStatus;
    totalAmount: import("@prisma/client-runtime-utils").Decimal;
    deliveryAddress: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateOrderStatus: (orderId: number, status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED", auditContext?: AuditContext) => Promise<{
    items: {
        id: number;
        orderId: number;
        productName: string;
        quantity: number;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
    }[];
} & {
    id: number;
    orderNo: string;
    patientId: number;
    orderDate: Date;
    status: import("../generated/prisma/enums").OrderStatus;
    paymentStatus: import("../generated/prisma/enums").PaymentStatus;
    totalAmount: import("@prisma/client-runtime-utils").Decimal;
    deliveryAddress: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updatePaymentStatus: (orderId: number, paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED", auditContext?: AuditContext) => Promise<{
    items: {
        id: number;
        orderId: number;
        productName: string;
        quantity: number;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
        createdAt: Date;
        updatedAt: Date;
    }[];
} & {
    id: number;
    orderNo: string;
    patientId: number;
    orderDate: Date;
    status: import("../generated/prisma/enums").OrderStatus;
    paymentStatus: import("../generated/prisma/enums").PaymentStatus;
    totalAmount: import("@prisma/client-runtime-utils").Decimal;
    deliveryAddress: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const deleteOrder: (orderId: number) => Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=order.service.d.ts.map