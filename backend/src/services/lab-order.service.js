"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLabResultDownload = exports.acknowledgeLabTestOrder = exports.uploadLabTestResult = exports.updateLabTestOrderStatus = exports.getLabTestOrderById = exports.listLabTestOrders = exports.createLabTestOrder = exports.stripResultForPatient = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../config/prisma");
const audit_service_1 = require("./audit.service");
const userSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    role: true,
};
const detailInclude = {
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
    doctor: {
        select: {
            id: true,
            doctorCode: true,
            firstName: true,
            lastName: true,
            specialization: true,
            status: true,
        },
    },
    appointment: {
        select: {
            id: true,
            appointmentNo: true,
            appointmentAt: true,
            status: true,
            patientId: true,
            doctorId: true,
        },
    },
    createdBy: { select: userSelect },
    resultUploadedBy: { select: userSelect },
    acknowledgedBy: { select: userSelect },
    resultDocument: {
        select: {
            id: true,
            originalName: true,
            documentType: true,
            mimeType: true,
            size: true,
            createdAt: true,
        },
    },
};
const RESULT_FIELDS_FOR_PATIENT_GATE = [
    "resultSummary",
    "resultFlag",
    "resultOriginalName",
    "resultStoredName",
    "resultMimeType",
    "resultSize",
    "resultFilePath",
    "resultUploadedAt",
    "resultUploadedByUserId",
    "resultUploadedBy",
    "resultDocumentId",
    "resultDocument",
];
const stripResultForPatient = (order) => {
    if (order.status === "ACKNOWLEDGED") {
        const { resultFilePath, resultStoredName, ...rest } = order;
        return {
            ...rest,
            hasResultFile: Boolean(resultFilePath || order.resultDocumentId),
        };
    }
    const stripped = { ...order };
    for (const field of RESULT_FIELDS_FOR_PATIENT_GATE) {
        delete stripped[field];
    }
    stripped.hasResultFile = false;
    return stripped;
};
exports.stripResultForPatient = stripResultForPatient;
const deleteFileIfExists = (filePath) => {
    if (filePath && fs_1.default.existsSync(filePath)) {
        try {
            fs_1.default.unlinkSync(filePath);
        }
        catch (error) {
            console.error("LAB_RESULT_FILE_DELETE_FAILED:", error);
        }
    }
};
const resolvePatientIdForUser = async (userId) => {
    const patient = await prisma_1.prisma.patient.findFirst({
        where: { userId },
        select: { id: true },
    });
    if (!patient) {
        throw new Error("PATIENT_PROFILE_NOT_FOUND");
    }
    return patient.id;
};
const createLabTestOrder = async (input) => {
    const { patientId, doctorId, testName, appointmentId, notes, orderedAt, createdByUserId, role, } = input;
    if (role !== "ADMIN" && role !== "DOCTOR") {
        throw new Error("FORBIDDEN");
    }
    const patient = await prisma_1.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    const doctor = await prisma_1.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
        throw new Error("DOCTOR_NOT_FOUND");
    }
    if (doctor.status !== "ACTIVE") {
        throw new Error("DOCTOR_NOT_ACTIVE");
    }
    if (appointmentId !== undefined) {
        const appointment = await prisma_1.prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment) {
            throw new Error("APPOINTMENT_NOT_FOUND");
        }
        if (appointment.patientId !== patientId) {
            throw new Error("APPOINTMENT_PATIENT_MISMATCH");
        }
        if (appointment.doctorId !== doctorId) {
            throw new Error("APPOINTMENT_DOCTOR_MISMATCH");
        }
    }
    const orderNo = `LAB-${Date.now()}`;
    const created = await prisma_1.prisma.labTestOrder.create({
        data: {
            orderNo,
            patientId,
            doctorId,
            appointmentId: appointmentId ?? null,
            testName: testName.trim(),
            notes: notes?.trim() || null,
            orderedAt: orderedAt ? new Date(orderedAt) : new Date(),
            createdByUserId,
            status: "REQUESTED",
        },
        include: detailInclude,
    });
    await (0, audit_service_1.safeRecordAuditEvent)({
        actorUserId: createdByUserId,
        actorRole: role,
        action: "CREATE",
        entityType: "LAB_TEST_ORDER",
        entityId: created.id,
        metadata: {
            orderNo: created.orderNo,
            patientId,
            doctorId,
            testName: created.testName,
            appointmentId: appointmentId ?? null,
        },
    });
    return created;
};
exports.createLabTestOrder = createLabTestOrder;
const listLabTestOrders = async (input) => {
    const { role, actorUserId, status, patientId, doctorId } = input;
    if (role !== "ADMIN" && role !== "DOCTOR" && role !== "PATIENT") {
        throw new Error("FORBIDDEN");
    }
    const where = {};
    if (status) {
        where.status = status;
    }
    if (doctorId !== undefined) {
        where.doctorId = doctorId;
    }
    if (role === "PATIENT") {
        const ownPatientId = await resolvePatientIdForUser(actorUserId);
        if (patientId !== undefined && patientId !== ownPatientId) {
            throw new Error("FORBIDDEN");
        }
        where.patientId = ownPatientId;
    }
    else if (patientId !== undefined) {
        where.patientId = patientId;
    }
    const orders = await prisma_1.prisma.labTestOrder.findMany({
        where,
        include: detailInclude,
        orderBy: { orderedAt: "desc" },
    });
    if (role === "PATIENT") {
        return orders.map((order) => (0, exports.stripResultForPatient)(order));
    }
    return orders;
};
exports.listLabTestOrders = listLabTestOrders;
const getLabTestOrderById = async (input) => {
    const { id, role, actorUserId } = input;
    if (role !== "ADMIN" && role !== "DOCTOR" && role !== "PATIENT") {
        throw new Error("FORBIDDEN");
    }
    const order = await prisma_1.prisma.labTestOrder.findUnique({
        where: { id },
        include: detailInclude,
    });
    if (!order) {
        throw new Error("LAB_TEST_ORDER_NOT_FOUND");
    }
    if (role === "PATIENT") {
        const ownPatientId = await resolvePatientIdForUser(actorUserId);
        if (order.patientId !== ownPatientId) {
            throw new Error("FORBIDDEN");
        }
        return (0, exports.stripResultForPatient)(order);
    }
    return order;
};
exports.getLabTestOrderById = getLabTestOrderById;
const updateLabTestOrderStatus = async (input) => {
    const { id, nextStatus, rejectionReason, actorUserId, role } = input;
    if (role !== "ADMIN" && role !== "DOCTOR") {
        throw new Error("FORBIDDEN");
    }
    const order = await prisma_1.prisma.labTestOrder.findUnique({ where: { id } });
    if (!order) {
        throw new Error("LAB_TEST_ORDER_NOT_FOUND");
    }
    const from = order.status;
    const assertTransition = (allowed) => {
        if (!allowed) {
            throw new Error("INVALID_STATUS_TRANSITION");
        }
    };
    if (nextStatus === "SAMPLE_COLLECTED") {
        if (role !== "ADMIN")
            throw new Error("FORBIDDEN");
        assertTransition(from === "REQUESTED");
    }
    else if (nextStatus === "PROCESSING") {
        if (role !== "ADMIN")
            throw new Error("FORBIDDEN");
        assertTransition(from === "SAMPLE_COLLECTED" || from === "REJECTED");
    }
    else if (nextStatus === "CANCELLED") {
        assertTransition(from === "REQUESTED" || from === "SAMPLE_COLLECTED");
    }
    else if (nextStatus === "REJECTED") {
        assertTransition(from === "RESULT_AVAILABLE");
        if (!rejectionReason?.trim()) {
            throw new Error("REJECTION_REASON_REQUIRED");
        }
    }
    const updated = await prisma_1.prisma.labTestOrder.update({
        where: { id },
        data: {
            status: nextStatus,
            rejectionReason: nextStatus === "REJECTED"
                ? rejectionReason.trim()
                : order.rejectionReason,
        },
        include: detailInclude,
    });
    const auditAction = nextStatus === "CANCELLED"
        ? "CANCEL"
        : nextStatus === "REJECTED"
            ? "REJECT"
            : "STATUS_CHANGE";
    await (0, audit_service_1.safeRecordAuditEvent)({
        actorUserId,
        actorRole: role,
        action: auditAction,
        entityType: "LAB_TEST_ORDER",
        entityId: id,
        metadata: {
            from,
            to: nextStatus,
            ...(nextStatus === "REJECTED"
                ? { reason: rejectionReason.trim() }
                : {}),
        },
    });
    return updated;
};
exports.updateLabTestOrderStatus = updateLabTestOrderStatus;
const uploadLabTestResult = async (input) => {
    const { id, resultSummary, resultFlag, file, actorUserId, role } = input;
    if (role !== "ADMIN") {
        throw new Error("FORBIDDEN");
    }
    const order = await prisma_1.prisma.labTestOrder.findUnique({ where: { id } });
    if (!order) {
        throw new Error("LAB_TEST_ORDER_NOT_FOUND");
    }
    if (order.status === "ACKNOWLEDGED") {
        throw new Error("RESULT_IMMUTABLE");
    }
    if (order.status !== "PROCESSING" && order.status !== "RESULT_AVAILABLE") {
        throw new Error("INVALID_STATUS_TRANSITION");
    }
    if (!resultSummary?.trim()) {
        throw new Error("RESULT_SUMMARY_REQUIRED");
    }
    const previousFilePath = order.resultFilePath;
    const updated = await prisma_1.prisma.labTestOrder.update({
        where: { id },
        data: {
            status: "RESULT_AVAILABLE",
            resultSummary: resultSummary.trim(),
            resultFlag,
            resultOriginalName: file?.originalName ?? order.resultOriginalName,
            resultStoredName: file?.storedName ?? order.resultStoredName,
            resultMimeType: file?.mimeType ?? order.resultMimeType,
            resultSize: file?.size ?? order.resultSize,
            resultFilePath: file?.filePath ?? order.resultFilePath,
            resultUploadedAt: new Date(),
            resultUploadedByUserId: actorUserId,
            rejectionReason: null,
        },
        include: detailInclude,
    });
    if (file && previousFilePath && previousFilePath !== file.filePath) {
        deleteFileIfExists(previousFilePath);
    }
    await (0, audit_service_1.safeRecordAuditEvent)({
        actorUserId,
        actorRole: role,
        action: "UPDATE",
        entityType: "LAB_TEST_ORDER",
        entityId: id,
        metadata: {
            resultFlag,
            hasFile: Boolean(file || updated.resultFilePath),
            replaced: order.status === "RESULT_AVAILABLE",
        },
    });
    return updated;
};
exports.uploadLabTestResult = uploadLabTestResult;
const acknowledgeLabTestOrder = async (input) => {
    const { id, actorUserId, role } = input;
    if (role !== "ADMIN" && role !== "DOCTOR") {
        throw new Error("FORBIDDEN");
    }
    const order = await prisma_1.prisma.labTestOrder.findUnique({ where: { id } });
    if (!order) {
        throw new Error("LAB_TEST_ORDER_NOT_FOUND");
    }
    if (order.status !== "RESULT_AVAILABLE") {
        throw new Error("INVALID_STATUS_TRANSITION");
    }
    if (!order.resultSummary || !order.resultFlag) {
        throw new Error("RESULT_MISSING");
    }
    const updated = await prisma_1.prisma.$transaction(async (tx) => {
        let resultDocumentId = order.resultDocumentId;
        if (!resultDocumentId && order.resultFilePath && order.resultStoredName) {
            const document = await tx.patientDocument.create({
                data: {
                    patientId: order.patientId,
                    originalName: order.resultOriginalName || order.resultStoredName,
                    storedName: order.resultStoredName,
                    documentType: "Lab Report",
                    mimeType: order.resultMimeType || "application/octet-stream",
                    size: order.resultSize || 0,
                    filePath: order.resultFilePath,
                },
            });
            resultDocumentId = document.id;
        }
        else if (!resultDocumentId) {
            const uploadDir = path_1.default.join(process.cwd(), "uploads", "patient-documents");
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            const storedName = `${Date.now()}-${crypto_1.default
                .randomBytes(8)
                .toString("hex")}.txt`;
            const filePath = path_1.default.join(uploadDir, storedName);
            const content = `Lab Test: ${order.testName}\nFlag: ${order.resultFlag}\n\n${order.resultSummary}\n`;
            fs_1.default.writeFileSync(filePath, content, "utf8");
            const document = await tx.patientDocument.create({
                data: {
                    patientId: order.patientId,
                    originalName: `${order.orderNo}-result.txt`,
                    storedName,
                    documentType: "Lab Report",
                    mimeType: "text/plain",
                    size: Buffer.byteLength(content, "utf8"),
                    filePath,
                },
            });
            resultDocumentId = document.id;
        }
        return tx.labTestOrder.update({
            where: { id },
            data: {
                status: "ACKNOWLEDGED",
                acknowledgedByUserId: actorUserId,
                acknowledgedAt: new Date(),
                resultDocumentId,
            },
            include: detailInclude,
        });
    });
    await (0, audit_service_1.safeRecordAuditEvent)({
        actorUserId,
        actorRole: role,
        action: "APPROVE",
        entityType: "LAB_TEST_ORDER",
        entityId: id,
        metadata: {
            resultFlag: order.resultFlag,
            resultDocumentId: updated.resultDocumentId,
        },
    });
    return updated;
};
exports.acknowledgeLabTestOrder = acknowledgeLabTestOrder;
const getLabResultDownload = async (input) => {
    const { id, role, actorUserId } = input;
    if (role !== "ADMIN" && role !== "DOCTOR" && role !== "PATIENT") {
        throw new Error("FORBIDDEN");
    }
    const order = await prisma_1.prisma.labTestOrder.findUnique({
        where: { id },
        include: {
            resultDocument: true,
            patient: { select: { userId: true } },
        },
    });
    if (!order) {
        throw new Error("LAB_TEST_ORDER_NOT_FOUND");
    }
    if (role === "PATIENT") {
        const ownPatientId = await resolvePatientIdForUser(actorUserId);
        if (order.patientId !== ownPatientId) {
            throw new Error("FORBIDDEN");
        }
        if (order.status !== "ACKNOWLEDGED") {
            throw new Error("RESULT_NOT_AVAILABLE");
        }
    }
    const filePath = order.resultDocument?.filePath || order.resultFilePath || null;
    const originalName = order.resultDocument?.originalName ||
        order.resultOriginalName ||
        `${order.orderNo}-result`;
    if (!filePath || !fs_1.default.existsSync(filePath)) {
        throw new Error("RESULT_FILE_NOT_FOUND");
    }
    return {
        filePath,
        originalName,
    };
};
exports.getLabResultDownload = getLabResultDownload;
//# sourceMappingURL=lab-order.service.js.map