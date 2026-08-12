import fs from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { safeRecordAuditEvent } from "./audit.service";

export type LabTestOrderStatusValue =
  | "REQUESTED"
  | "SAMPLE_COLLECTED"
  | "PROCESSING"
  | "RESULT_AVAILABLE"
  | "ACKNOWLEDGED"
  | "CANCELLED"
  | "REJECTED";

export type LabResultFlagValue = "NORMAL" | "ABNORMAL" | "CRITICAL";

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
} as const;

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
} as const;

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
] as const;

export const stripResultForPatient = <T extends Record<string, unknown>>(
  order: T
): T => {
  if (order.status === "ACKNOWLEDGED") {
    const { resultFilePath, resultStoredName, ...rest } = order;
    return {
      ...rest,
      hasResultFile: Boolean(resultFilePath || order.resultDocumentId),
    } as unknown as T;
  }

  const stripped: Record<string, unknown> = { ...order };
  for (const field of RESULT_FIELDS_FOR_PATIENT_GATE) {
    delete stripped[field];
  }
  stripped.hasResultFile = false;
  return stripped as T;
};

const deleteFileIfExists = (filePath?: string | null) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("LAB_RESULT_FILE_DELETE_FAILED:", error);
    }
  }
};

const resolvePatientIdForUser = async (userId: number) => {
  const patient = await prisma.patient.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (!patient) {
    throw new Error("PATIENT_PROFILE_NOT_FOUND");
  }
  return patient.id;
};

export const createLabTestOrder = async (input: {
  patientId: number;
  doctorId: number;
  testName: string;
  appointmentId?: number;
  notes?: string;
  orderedAt?: string;
  createdByUserId: number;
  role: string;
}) => {
  const {
    patientId,
    doctorId,
    testName,
    appointmentId,
    notes,
    orderedAt,
    createdByUserId,
    role,
  } = input;

  if (role !== "ADMIN" && role !== "DOCTOR") {
    throw new Error("FORBIDDEN");
  }

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }
  if (doctor.status !== "ACTIVE") {
    throw new Error("DOCTOR_NOT_ACTIVE");
  }

  if (appointmentId !== undefined) {
    const appointment = await prisma.appointment.findUnique({
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

  const created = await prisma.labTestOrder.create({
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

  await safeRecordAuditEvent({
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

export const listLabTestOrders = async (input: {
  role: string;
  actorUserId: number;
  status?: LabTestOrderStatusValue;
  patientId?: number;
  doctorId?: number;
}) => {
  const { role, actorUserId, status, patientId, doctorId } = input;

  if (role !== "ADMIN" && role !== "DOCTOR" && role !== "PATIENT") {
    throw new Error("FORBIDDEN");
  }

  const where: {
    status?: LabTestOrderStatusValue;
    patientId?: number;
    doctorId?: number;
  } = {};

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
  } else if (patientId !== undefined) {
    where.patientId = patientId;
  }

  const orders = await prisma.labTestOrder.findMany({
    where,
    include: detailInclude,
    orderBy: { orderedAt: "desc" },
  });

  if (role === "PATIENT") {
    return orders.map((order) =>
      stripResultForPatient(order as unknown as Record<string, unknown>)
    );
  }

  return orders;
};

export const getLabTestOrderById = async (input: {
  id: number;
  role: string;
  actorUserId: number;
}) => {
  const { id, role, actorUserId } = input;

  if (role !== "ADMIN" && role !== "DOCTOR" && role !== "PATIENT") {
    throw new Error("FORBIDDEN");
  }

  const order = await prisma.labTestOrder.findUnique({
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
    return stripResultForPatient(order as unknown as Record<string, unknown>);
  }

  return order;
};

export const updateLabTestOrderStatus = async (input: {
  id: number;
  nextStatus: "SAMPLE_COLLECTED" | "PROCESSING" | "CANCELLED" | "REJECTED";
  rejectionReason?: string;
  actorUserId: number;
  role: string;
}) => {
  const { id, nextStatus, rejectionReason, actorUserId, role } = input;

  if (role !== "ADMIN" && role !== "DOCTOR") {
    throw new Error("FORBIDDEN");
  }

  const order = await prisma.labTestOrder.findUnique({ where: { id } });
  if (!order) {
    throw new Error("LAB_TEST_ORDER_NOT_FOUND");
  }

  const from = order.status as LabTestOrderStatusValue;

  const assertTransition = (allowed: boolean) => {
    if (!allowed) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }
  };

  if (nextStatus === "SAMPLE_COLLECTED") {
    if (role !== "ADMIN") throw new Error("FORBIDDEN");
    assertTransition(from === "REQUESTED");
  } else if (nextStatus === "PROCESSING") {
    if (role !== "ADMIN") throw new Error("FORBIDDEN");
    assertTransition(from === "SAMPLE_COLLECTED" || from === "REJECTED");
  } else if (nextStatus === "CANCELLED") {
    assertTransition(from === "REQUESTED" || from === "SAMPLE_COLLECTED");
  } else if (nextStatus === "REJECTED") {
    assertTransition(from === "RESULT_AVAILABLE");
    if (!rejectionReason?.trim()) {
      throw new Error("REJECTION_REASON_REQUIRED");
    }
  }

  const updated = await prisma.labTestOrder.update({
    where: { id },
    data: {
      status: nextStatus,
      rejectionReason:
        nextStatus === "REJECTED"
          ? rejectionReason!.trim()
          : order.rejectionReason,
    },
    include: detailInclude,
  });

  const auditAction =
    nextStatus === "CANCELLED"
      ? "CANCEL"
      : nextStatus === "REJECTED"
        ? "REJECT"
        : "STATUS_CHANGE";

  await safeRecordAuditEvent({
    actorUserId,
    actorRole: role,
    action: auditAction,
    entityType: "LAB_TEST_ORDER",
    entityId: id,
    metadata: {
      from,
      to: nextStatus,
      ...(nextStatus === "REJECTED"
        ? { reason: rejectionReason!.trim() }
        : {}),
    },
  });

  return updated;
};

export const uploadLabTestResult = async (input: {
  id: number;
  resultSummary: string;
  resultFlag: LabResultFlagValue;
  file?: {
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
    filePath: string;
  };
  actorUserId: number;
  role: string;
}) => {
  const { id, resultSummary, resultFlag, file, actorUserId, role } = input;

  if (role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  const order = await prisma.labTestOrder.findUnique({ where: { id } });
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

  const updated = await prisma.labTestOrder.update({
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

  await safeRecordAuditEvent({
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

export const acknowledgeLabTestOrder = async (input: {
  id: number;
  actorUserId: number;
  role: string;
}) => {
  const { id, actorUserId, role } = input;

  if (role !== "ADMIN" && role !== "DOCTOR") {
    throw new Error("FORBIDDEN");
  }

  const order = await prisma.labTestOrder.findUnique({ where: { id } });
  if (!order) {
    throw new Error("LAB_TEST_ORDER_NOT_FOUND");
  }

  if (order.status !== "RESULT_AVAILABLE") {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  if (!order.resultSummary || !order.resultFlag) {
    throw new Error("RESULT_MISSING");
  }

  const updated = await prisma.$transaction(async (tx) => {
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
    } else if (!resultDocumentId) {
      const uploadDir = path.join(
        process.cwd(),
        "uploads",
        "patient-documents"
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const storedName = `${Date.now()}-${crypto
        .randomBytes(8)
        .toString("hex")}.txt`;
      const filePath = path.join(uploadDir, storedName);
      const content = `Lab Test: ${order.testName}\nFlag: ${order.resultFlag}\n\n${order.resultSummary}\n`;
      fs.writeFileSync(filePath, content, "utf8");

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

  await safeRecordAuditEvent({
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

export const getLabResultDownload = async (input: {
  id: number;
  role: string;
  actorUserId: number;
}) => {
  const { id, role, actorUserId } = input;

  if (role !== "ADMIN" && role !== "DOCTOR" && role !== "PATIENT") {
    throw new Error("FORBIDDEN");
  }

  const order = await prisma.labTestOrder.findUnique({
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

  const filePath =
    order.resultDocument?.filePath || order.resultFilePath || null;
  const originalName =
    order.resultDocument?.originalName ||
    order.resultOriginalName ||
    `${order.orderNo}-result`;

  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error("RESULT_FILE_NOT_FOUND");
  }

  return {
    filePath,
    originalName,
  };
};
