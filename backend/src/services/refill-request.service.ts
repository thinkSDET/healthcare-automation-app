import { prisma } from "../config/prisma";
import * as orderService from "./order.service";

export type RefillRequestTypeValue = "REFILL" | "RENEWAL";
export type RefillRequestStatusValue =
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "FULFILLED";

const TERMINAL: RefillRequestStatusValue[] = [
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
} as const;

const canApproveOrReject = (
  role: string,
  requestType: RefillRequestTypeValue
) => {
  if (role === "ADMIN" || role === "DOCTOR") {
    return true;
  }
  if (role === "PHARMACIST" && requestType === "REFILL") {
    return true;
  }
  return false;
};

export const createRefillRequest = async (input: {
  prescriptionId: number;
  requestType: RefillRequestTypeValue;
  notes?: string;
  requestedByUserId: number;
  role: string;
}) => {
  const { prescriptionId, requestType, notes, requestedByUserId, role } =
    input;

  if (role === "PHARMACIST" && requestType === "RENEWAL") {
    throw new Error("PHARMACIST_CANNOT_REQUEST_RENEWAL");
  }

  if (role === "DOCTOR") {
    throw new Error("FORBIDDEN");
  }

  if (!["ADMIN", "PHARMACIST", "PATIENT"].includes(role)) {
    throw new Error("FORBIDDEN");
  }

  const prescription = await prisma.prescription.findUnique({
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

  if (
    requestType === "RENEWAL" &&
    prescription.status !== "ACTIVE" &&
    prescription.status !== "COMPLETED"
  ) {
    throw new Error("PRESCRIPTION_NOT_ELIGIBLE");
  }

  if (role === "PATIENT") {
    if (prescription.patient.userId !== requestedByUserId) {
      throw new Error("FORBIDDEN");
    }
  }

  const existingOpen = await prisma.prescriptionRefillRequest.findFirst({
    where: {
      prescriptionId,
      status: "SUBMITTED",
    },
  });

  if (existingOpen) {
    throw new Error("DUPLICATE_SUBMITTED_REQUEST");
  }

  const requestNo = `RR-${Date.now()}`;

  return prisma.prescriptionRefillRequest.create({
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
};

export const listRefillRequests = async (filters: {
  role: string;
  userId: number;
  ownPatientId: number | null;
  status?: RefillRequestStatusValue;
  patientId?: number;
  requestType?: RefillRequestTypeValue;
}) => {
  const where: Record<string, unknown> = {};

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
  } else if (filters.patientId) {
    where.patientId = filters.patientId;
  }

  return prisma.prescriptionRefillRequest.findMany({
    where,
    include: detailInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getRefillRequestById = async (
  id: number,
  access: {
    role: string;
    userId: number;
    ownPatientId: number | null;
  }
) => {
  const request = await prisma.prescriptionRefillRequest.findUnique({
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

export const updateRefillRequestStatus = async (input: {
  id: number;
  nextStatus: "APPROVED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string;
  actorUserId: number;
  role: string;
}) => {
  const { id, nextStatus, rejectionReason, actorUserId, role } = input;

  const existing = await prisma.prescriptionRefillRequest.findUnique({
    where: { id },
    include: {
      prescription: true,
    },
  });

  if (!existing) {
    throw new Error("REFILL_REQUEST_NOT_FOUND");
  }

  const current = existing.status as RefillRequestStatusValue;

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
  } else {
    if (
      !canApproveOrReject(
        role,
        existing.requestType as RefillRequestTypeValue
      )
    ) {
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

  const updated = await prisma.prescriptionRefillRequest.updateMany({
    where: {
      id,
      status: "SUBMITTED",
    },
    data: {
      status: nextStatus,
      rejectionReason:
        nextStatus === "REJECTED"
          ? rejectionReason!.trim()
          : null,
      reviewedByUserId:
        nextStatus === "CANCELLED" ? null : actorUserId,
      reviewedAt: nextStatus === "CANCELLED" ? null : new Date(),
    },
  });

  if (updated.count === 0) {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  return prisma.prescriptionRefillRequest.findUniqueOrThrow({
    where: { id },
    include: detailInclude,
  });
};

export const createOrderFromRefillRequest = async (input: {
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
}) => {
  const { id, actorUserId, role, ownPatientId, deliveryAddress, notes, items } =
    input;

  if (role !== "ADMIN" && role !== "PATIENT") {
    throw new Error("FORBIDDEN");
  }

  const request = await prisma.prescriptionRefillRequest.findUnique({
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
    notes:
      notes ||
      `Refill request ${request.requestNo} (${request.requestType})`,
    items,
  });

  try {
    const linked = await prisma.prescriptionRefillRequest.updateMany({
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
  } catch (error) {
    throw error;
  }

  return prisma.prescriptionRefillRequest.findUniqueOrThrow({
    where: { id },
    include: detailInclude,
  });
};
