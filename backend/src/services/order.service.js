"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updatePaymentStatus = exports.updateOrderStatus = exports.createOrder = exports.getOrderById = exports.getPatientOrders = void 0;
const prisma_1 = require("../config/prisma");
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
const getOrderById = async (orderId) => {
    const order = await prisma_1.prisma.order.findUnique({
        where: {
            id: orderId,
        },
        include: {
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
        },
    });
    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }
    return order;
};
exports.getOrderById = getOrderById;
/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/
const createOrder = async (data) => {
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
    return prisma_1.prisma.order.create({
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
};
exports.createOrder = createOrder;
/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
*/
const updateOrderStatus = async (orderId, status) => {
    const order = await prisma_1.prisma.order.findUnique({
        where: {
            id: orderId,
        },
    });
    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }
    return prisma_1.prisma.order.update({
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
};
exports.updateOrderStatus = updateOrderStatus;
/*
|--------------------------------------------------------------------------
| Update Payment Status
|--------------------------------------------------------------------------
*/
const updatePaymentStatus = async (orderId, paymentStatus) => {
    const order = await prisma_1.prisma.order.findUnique({
        where: {
            id: orderId,
        },
    });
    if (!order) {
        throw new Error("ORDER_NOT_FOUND");
    }
    return prisma_1.prisma.order.update({
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