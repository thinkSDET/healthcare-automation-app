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
exports.createOrderFromRefillRequest = exports.updateRefillRequestStatus = exports.getRefillRequestById = exports.listRefillRequests = exports.createRefillRequest = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const prisma_1 = require("../config/prisma");
const audit_service_1 = require("./audit.service");
const orderService = __importStar(require("./order.service"));
const TERMINAL = [
    "REJECTED",
    "CANCELLED",
    "FULFILLED",
];
const detailInclude = {
    prescription: {
        include: {
            items: true,
            doctor: {
                select: {
                    id: true,
                    doctorCode: true,
                    firstName: true,
                    lastName: true,
                    specialization: true,
                },
            },
        },
    },
    patient: {
        select: {
            id: true,
            medicalId: true,
            firstName: true,
            lastName: true,
            status: true,
            userId: true,
        },
    },
    order: {
        select: {
            id: true,
            orderNo: true,
            status: true,
            paymentStatus: true,
            totalAmount: true,
        },
    },
    requestedBy: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
        },
    },
    reviewedBy: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
        },
    },
};
const canApproveOrReject = (role, requestType) => {
    if (role === "ADMIN" || role === "DOCTOR") {
        return true;
    }
    if (role === "PHARMACIST" && requestType === "REFILL") {
        return true;
    }
    return false;
};
const createRefillRequest = async (input) => {
    const { prescriptionId, requestType, notes, requestedByUserId, role } = input;
    if (role === "PHARMACIST" && requestType === "RENEWAL") {
        throw new Error("PHARMACIST_CANNOT_REQUEST_RENEWAL");
    }
    if (role === "DOCTOR") {
        throw new Error("FORBIDDEN");
    }
    if (!["ADMIN", "PHARMACIST", "PATIENT"].includes(role)) {
        throw new Error("FORBIDDEN");
    }
    const prescription = await prisma_1.prisma.prescription.findUnique({
        where: { id: prescriptionId },
        include: { patient: true, items: true },
    });
    if (!prescription) {
        throw new Error("PRESCRIPTION_NOT_FOUND");
    }
    if (prescription.patient.status !== "ACTIVE") {
        throw new Error("PATIENT_NOT_ACTIVE");
    }
    if (prescription.status === "CANCELLED") {
        throw new Error("PRESCRIPTION_NOT_ELIGIBLE");
    }
    if (requestType === "REFILL" && prescription.status !== "ACTIVE") {
        throw new Error("PRESCRIPTION_NOT_ELIGIBLE");
    }
    if (requestType === "RENEWAL" &&
        prescription.status !== "ACTIVE" &&
        prescription.status !== "COMPLETED") {
        throw new Error("PRESCRIPTION_NOT_ELIGIBLE");
    }
    if (role === "PATIENT") {
        if (prescription.patient.userId !== requestedByUserId) {
            throw new Error("FORBIDDEN");
        }
    }
    const existingOpen = await prisma_1.prisma.prescriptionRefillRequest.findFirst({
        where: {
            prescriptionId,
            status: "SUBMITTED",
        },
    });
    if (existingOpen) {
        throw new Error("DUPLICATE_SUBMITTED_REQUEST");
    }
    const requestNo = `RR-${Date.now()}`;
    const created = await prisma_1.prisma.prescriptionRefillRequest.create({
        data: {
            requestNo,
            prescriptionId,
            patientId: prescription.patientId,
            requestType,
            status: "SUBMITTED",
            requestedByUserId,
            notes: notes?.trim() || null,
        },
        include: detailInclude,
    });
    await (0, audit_service_1.safeRecordAuditEvent)({
        actorUserId: requestedByUserId,
        actorRole: role,
        action: "CREATE",
        entityType: "REFILL_REQUEST",
        entityId: created.id,
        metadata: {
            requestNo: created.requestNo,
            prescriptionId: created.prescriptionId,
            requestType: created.requestType,
            patientId: created.patientId,
        },
    });
    return created;
};
exports.createRefillRequest = createRefillRequest;
const listRefillRequests = async (filters) => {
    const where = {};
    if (filters.status) {
        where.status = filters.status;
    }
    if (filters.requestType) {
        where.requestType = filters.requestType;
    }
    if (filters.role === "PATIENT") {
        if (!filters.ownPatientId) {
            throw new Error("NO_PATIENT_LINK");
        }
        where.patientId = filters.ownPatientId;
    }
    else if (filters.patientId) {
        where.patientId = filters.patientId;
    }
    return prisma_1.prisma.prescriptionRefillRequest.findMany({
        where,
        include: detailInclude,
        orderBy: { createdAt: "desc" },
    });
};
exports.listRefillRequests = listRefillRequests;
const getRefillRequestById = async (id, access) => {
    const request = await prisma_1.prisma.prescriptionRefillRequest.findUnique({
        where: { id },
        include: detailInclude,
    });
    if (!request) {
        throw new Error("REFILL_REQUEST_NOT_FOUND");
    }
    if (access.role === "PATIENT") {
        if (!access.ownPatientId || request.patientId !== access.ownPatientId) {
            throw new Error("FORBIDDEN");
        }
    }
    return request;
};
exports.getRefillRequestById = getRefillRequestById;
const updateRefillRequestStatus = async (input) => {
    const { id, nextStatus, rejectionReason, actorUserId, role } = input;
    const existing = await prisma_1.prisma.prescriptionRefillRequest.findUnique({
        where: { id },
        include: {
            prescription: true,
        },
    });
    if (!existing) {
        throw new Error("REFILL_REQUEST_NOT_FOUND");
    }
    const current = existing.status;
    if (TERMINAL.includes(current)) {
        throw new Error("INVALID_STATUS_TRANSITION");
    }
    if (current !== "SUBMITTED") {
        throw new Error("INVALID_STATUS_TRANSITION");
    }
    if (nextStatus === "CANCELLED") {
        const isAdmin = role === "ADMIN";
        const isRequester = existing.requestedByUserId === actorUserId;
        if (!isAdmin && !isRequester) {
            throw new Error("FORBIDDEN");
        }
        if (role === "DOCTOR") {
            throw new Error("FORBIDDEN");
        }
    }
    else {
        if (!canApproveOrReject(role, existing.requestType)) {
            throw new Error("FORBIDDEN");
        }
    }
    if (nextStatus === "APPROVED" || nextStatus === "REJECTED") {
        if (existing.prescription.status === "CANCELLED") {
            throw new Error("PRESCRIPTION_NOT_ELIGIBLE");
        }
    }
    if (nextStatus === "REJECTED" && !rejectionReason?.trim()) {
        throw new Error("REJECTION_REASON_REQUIRED");
    }
    const updated = await prisma_1.prisma.prescriptionRefillRequest.updateMany({
        where: {
            id,
            status: "SUBMITTED",
        },
        data: {
            status: nextStatus,
            rejectionReason: nextStatus === "REJECTED"
                ? rejectionReason.trim()
                : null,
            reviewedByUserId: nextStatus === "CANCELLED" ? null : actorUserId,
            reviewedAt: nextStatus === "CANCELLED" ? null : new Date(),
        },
    });
    if (updated.count === 0) {
        throw new Error("INVALID_STATUS_TRANSITION");
    }
    const result = await prisma_1.prisma.prescriptionRefillRequest.findUniqueOrThrow({
        where: { id },
        include: detailInclude,
    });
    const action = nextStatus === "APPROVED"
        ? "APPROVE"
        : nextStatus === "REJECTED"
            ? "REJECT"
            : "CANCEL";
    await (0, audit_service_1.safeRecordAuditEvent)({
        actorUserId,
        actorRole: role,
        action,
        entityType: "REFILL_REQUEST",
        entityId: result.id,
        metadata: {
            requestNo: result.requestNo,
            requestType: result.requestType,
            from: "SUBMITTED",
            to: nextStatus,
        },
    });
    return result;
};
exports.updateRefillRequestStatus = updateRefillRequestStatus;
const createOrderFromRefillRequest = async (input) => {
    const { id, actorUserId, role, ownPatientId, deliveryAddress, notes, items } = input;
    if (role !== "ADMIN" && role !== "PATIENT") {
        throw new Error("FORBIDDEN");
    }
    const request = await prisma_1.prisma.prescriptionRefillRequest.findUnique({
        where: { id },
        include: {
            prescription: {
                include: { items: true },
            },
            patient: true,
        },
    });
    if (!request) {
        throw new Error("REFILL_REQUEST_NOT_FOUND");
    }
    if (request.status !== "APPROVED") {
        throw new Error("REQUEST_NOT_APPROVED");
    }
    if (request.orderId) {
        throw new Error("ORDER_ALREADY_LINKED");
    }
    if (role === "PATIENT") {
        if (!ownPatientId || request.patientId !== ownPatientId) {
            throw new Error("FORBIDDEN");
        }
    }
    if (request.patient.status !== "ACTIVE") {
        throw new Error("PATIENT_NOT_ACTIVE");
    }
    const order = await orderService.createOrder({
        patientId: request.patientId,
        deliveryAddress,
        notes: notes ||
            `Refill request ${request.requestNo} (${request.requestType})`,
        items,
    }, {
        actorUserId,
        actorRole: role,
    });
    try {
        const linked = await prisma_1.prisma.prescriptionRefillRequest.updateMany({
            where: {
                id,
                status: "APPROVED",
                orderId: null,
            },
            data: {
                orderId: order.id,
                status: "FULFILLED",
                reviewedByUserId: request.reviewedByUserId ?? actorUserId,
                reviewedAt: request.reviewedAt ?? new Date(),
            },
        });
        if (linked.count === 0) {
            throw new Error("ORDER_ALREADY_LINKED");
        }
    }
    catch (error) {
        throw error;
    }
    const fulfilled = await prisma_1.prisma.prescriptionRefillRequest.findUniqueOrThrow({
        where: { id },
        include: detailInclude,
    });
    await (0, audit_service_1.safeRecordAuditEvent)({
        actorUserId,
        actorRole: role,
        action: "STATUS_CHANGE",
        entityType: "REFILL_REQUEST",
        entityId: fulfilled.id,
        metadata: {
            requestNo: fulfilled.requestNo,
            from: "APPROVED",
            to: "FULFILLED",
            orderId: order.id,
        },
    });
    return fulfilled;
};
exports.createOrderFromRefillRequest = createOrderFromRefillRequest;
//# sourceMappingURL=refill-request.service.js.map