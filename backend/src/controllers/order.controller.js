"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updatePaymentStatus = exports.updateOrderStatus = exports.createOrder = exports.getOrderById = exports.getPatientOrders = void 0;
const express_1 = require("express");
const orderService = __importStar(require("../services/order.service"));
/*
|--------------------------------------------------------------------------
| Get Patient Orders
|--------------------------------------------------------------------------
*/
const getPatientOrders = async (req, res) => {
    try {
        const patientId = Number(req.params.patientId);
        if (Number.isNaN(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }
        const orders = await orderService
            .getPatientOrders(patientId);
        return res.status(200).json({
            success: true,
            data: orders,
        });
    }
    catch (error) {
        console.error("GET PATIENT ORDERS ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
        });
    }
};
exports.getPatientOrders = getPatientOrders;
/*
|--------------------------------------------------------------------------
| Get Order By ID
|--------------------------------------------------------------------------
*/
const getOrderById = async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        if (Number.isNaN(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }
        const order = await orderService
            .getOrderById(orderId);
        return res.status(200).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        console.error("GET ORDER ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "ORDER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to fetch order",
        });
    }
};
exports.getOrderById = getOrderById;
/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/
const createOrder = async (req, res) => {
    try {
        const { patientId, orderDate, status, paymentStatus, deliveryAddress, notes, items, } = req.body;
        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: "Patient is required",
            });
        }
        if (!Array.isArray(items) ||
            items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one order item is required",
            });
        }
        const order = await orderService
            .createOrder({
            patientId: Number(patientId),
            orderDate,
            status,
            paymentStatus,
            deliveryAddress,
            notes,
            items,
        });
        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order,
        });
    }
    catch (error) {
        console.error("CREATE ORDER ERROR:", error);
        if (error instanceof Error) {
            switch (error.message) {
                case "PATIENT_NOT_FOUND":
                    return res.status(404).json({
                        success: false,
                        message: "Patient not found",
                    });
                case "ORDER_ITEMS_REQUIRED":
                    return res.status(400).json({
                        success: false,
                        message: "At least one order item is required",
                    });
                case "INVALID_ORDER_ITEM":
                    return res.status(400).json({
                        success: false,
                        message: "Product name, valid quantity and valid price are required for every item",
                    });
            }
        }
        return res.status(500).json({
            success: false,
            message: "Failed to create order",
        });
    }
};
exports.createOrder = createOrder;
/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
*/
const updateOrderStatus = async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const { status, } = req.body;
        if (Number.isNaN(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }
        const validStatuses = [
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
        ];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status",
            });
        }
        const order = await orderService
            .updateOrderStatus(orderId, status);
        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order,
        });
    }
    catch (error) {
        console.error("UPDATE ORDER STATUS ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "ORDER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to update order status",
        });
    }
};
exports.updateOrderStatus = updateOrderStatus;
/*
|--------------------------------------------------------------------------
| Update Payment Status
|--------------------------------------------------------------------------
*/
const updatePaymentStatus = async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const { paymentStatus, } = req.body;
        if (Number.isNaN(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }
        const validStatuses = [
            "PENDING",
            "PAID",
            "FAILED",
            "REFUNDED",
        ];
        if (!validStatuses.includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment status",
            });
        }
        const order = await orderService
            .updatePaymentStatus(orderId, paymentStatus);
        return res.status(200).json({
            success: true,
            message: "Payment status updated successfully",
            data: order,
        });
    }
    catch (error) {
        console.error("UPDATE PAYMENT STATUS ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "ORDER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to update payment status",
        });
    }
};
exports.updatePaymentStatus = updatePaymentStatus;
/*
|--------------------------------------------------------------------------
| Delete Order
|--------------------------------------------------------------------------
*/
const deleteOrder = async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        if (Number.isNaN(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }
        const result = await orderService
            .deleteOrder(orderId);
        return res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        console.error("DELETE ORDER ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "ORDER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to delete order",
        });
    }
};
exports.deleteOrder = deleteOrder;
//# sourceMappingURL=order.controller.js.map