"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updatePaymentStatus = exports.updateOrderStatus = exports.createOrder = exports.getOrderByIdentifier = exports.getOrderByOrderNo = exports.getOrderById = exports.getPatientOrders = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const prisma_1 = require("../config/prisma");
const audit_service_1 = require("./audit.service");
/*
|--------------------------------------------------------------------------
| Get Patient Orders
|--------------------------------------------------------------------------
*/
const getPatientOrders = async (patientId) => {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: {
            id: patientId,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.order.findMany({
        where: {
            patientId,
        },
        include: {
            items: true,
        },
        orderBy: {
            orderDate: "desc",
        },
    });
};
exports.getPatientOrders = getPatientOrders;
/*
|--------------------------------------------------------------------------
| Get Order By ID
|--------------------------------------------------------------------------
*/
const orderDetailInclude = {
    patient: {
        select: {
            id: true,
            medicalId: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
        },
    },
    items: true,
};
const getOrderById = async (orderId) => {
    const order = await prisma_1.prisma.order.findUnique({
        where: {
            id: orderId,
        },
        include: orderDetailInclude,
    });
    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }
    return order;
};
exports.getOrderById = getOrderById;
/*
|--------------------------------------------------------------------------
| Get Order By Public Order Number
|--------------------------------------------------------------------------
*/
const getOrderByOrderNo = async (orderNo) => {
    const normalized = orderNo.trim();
    if (!normalized) {
        throw new Error("ORDER_NOT_FOUND");
    }
    let order = await prisma_1.prisma.order.findUnique({
        where: {
            orderNo: normalized,
        },
        include: orderDetailInclude,
    });
    /*
     * Pharmacists sometimes paste only the
     * timestamp digits from ORD-{timestamp}.
     * Those values are not internal ids
     * (too large for Int PK), so retry with
     * the ORD- prefix.
     */
    if (!order &&
        /^\d+$/.test(normalized)) {
        order =
            await prisma_1.prisma.order.findUnique({
                where: {
                    orderNo: `ORD-${normalized}`,
                },
                include: orderDetailInclude,
            });
    }
    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }
    return order;
};
exports.getOrderByOrderNo = getOrderByOrderNo;
/*
|--------------------------------------------------------------------------
| Get Order By Path Identifier (id or orderNo)
|--------------------------------------------------------------------------
*/
/**
 * Resolve GET /api/orders/:id identifier.
 * - Digits within Prisma Int range → internal Order.id
 * - Otherwise → public orderNo (e.g. ORD-...)
 */
const getOrderByIdentifier = async (identifier) => {
    const raw = String(identifier || "").trim();
    if (!raw) {
        throw new Error("ORDER_NOT_FOUND");
    }
    const PRISMA_INT_MAX = 2147483647;
    const isInternalId = /^\d+$/.test(raw) &&
        Number.isSafeInteger(Number(raw)) &&
        Number(raw) >= 1 &&
        Number(raw) <= PRISMA_INT_MAX;
    if (isInternalId) {
        return (0, exports.getOrderById)(Number(raw));
    }
    return (0, exports.getOrderByOrderNo)(raw);
};
exports.getOrderByIdentifier = getOrderByIdentifier;
/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/
const createOrder = async (data, auditContext) => {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: {
            id: data.patientId,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    if (!data.items ||
        data.items.length === 0) {
        throw new Error("ORDER_ITEMS_REQUIRED");
    }
    for (const item of data.items) {
        if (!item.productName?.trim() ||
            !Number.isInteger(item.quantity) ||
            item.quantity <= 0 ||
            Number(item.unitPrice) < 0) {
            throw new Error("INVALID_ORDER_ITEM");
        }
    }
    const totalAmount = data.items.reduce((total, item) => total +
        item.quantity *
            Number(item.unitPrice), 0);
    const orderNo = `ORD-${Date.now()}`;
    const created = await prisma_1.prisma.order.create({
        data: {
            orderNo,
            patientId: data.patientId,
            orderDate: data.orderDate
                ? new Date(data.orderDate)
                : new Date(),
            status: data.status ||
                "PENDING",
            paymentStatus: data.paymentStatus ||
                "PENDING",
            totalAmount,
            deliveryAddress: data.deliveryAddress?.trim() ||
                null,
            notes: data.notes?.trim() ||
                null,
            items: {
                create: data.items.map((item) => ({
                    productName: item.productName.trim(),
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.quantity *
                        Number(item.unitPrice),
                })),
            },
        },
        include: {
            items: true,
            patient: {
                select: {
                    id: true,
                    medicalId: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });
    if (auditContext) {
        await (0, audit_service_1.safeRecordAuditEvent)({
            actorUserId: auditContext.actorUserId,
            actorRole: auditContext.actorRole,
            action: "CREATE",
            entityType: "ORDER",
            entityId: created.id,
            metadata: {
                orderNo: created.orderNo,
                patientId: created.patientId,
            },
        });
    }
    return created;
};
exports.createOrder = createOrder;
/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
*/
const updateOrderStatus = async (orderId, status, auditContext) => {
    const order = await prisma_1.prisma.order.findUnique({
        where: {
            id: orderId,
        },
    });
    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }
    const updated = await prisma_1.prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            status,
        },
        include: {
            items: true,
        },
    });
    if (auditContext) {
        await (0, audit_service_1.safeRecordAuditEvent)({
            actorUserId: auditContext.actorUserId,
            actorRole: auditContext.actorRole,
            action: "STATUS_CHANGE",
            entityType: "ORDER",
            entityId: updated.id,
            metadata: {
                orderNo: updated.orderNo,
                field: "status",
                from: order.status,
                to: status,
            },
        });
    }
    return updated;
};
exports.updateOrderStatus = updateOrderStatus;
/*
|--------------------------------------------------------------------------
| Update Payment Status
|--------------------------------------------------------------------------
*/
const updatePaymentStatus = async (orderId, paymentStatus, auditContext) => {
    const order = await prisma_1.prisma.order.findUnique({
        where: {
            id: orderId,
        },
    });
    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }
    const updated = await prisma_1.prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            paymentStatus,
        },
        include: {
            items: true,
        },
    });
    if (auditContext) {
        await (0, audit_service_1.safeRecordAuditEvent)({
            actorUserId: auditContext.actorUserId,
            actorRole: auditContext.actorRole,
            action: "STATUS_CHANGE",
            entityType: "ORDER",
            entityId: updated.id,
            metadata: {
                orderNo: updated.orderNo,
                field: "paymentStatus",
                from: order.paymentStatus,
                to: paymentStatus,
            },
        });
    }
    return updated;
};
exports.updatePaymentStatus = updatePaymentStatus;
/*
|--------------------------------------------------------------------------
| Delete Order
|--------------------------------------------------------------------------
*/
const deleteOrder = async (orderId) => {
    const order = await prisma_1.prisma.order.findUnique({
        where: {
            id: orderId,
        },
    });
    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }
    await prisma_1.prisma.order.delete({
        where: {
            id: orderId,
        },
    });
    return {
        message: "Order deleted successfully",
    };
};
exports.deleteOrder = deleteOrder;
//# sourceMappingURL=order.service.js.map