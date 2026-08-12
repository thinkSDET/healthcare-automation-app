import { prisma } from "../config/prisma";
import type { Prisma } from "../generated/prisma/client";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "STATUS_CHANGE"
  | "APPROVE"
  | "REJECT"
  | "CANCEL"
  | "DELETE";

export type AuditEntityType =
  | "PATIENT"
  | "APPOINTMENT"
  | "APPOINTMENT_REQUEST"
  | "PRESCRIPTION"
  | "REFILL_REQUEST"
  | "ORDER";

export type AuditContext = {
  actorUserId: number;
  actorRole: string;
};

export type RecordAuditEventInput = {
  actorUserId?: number | null;
  actorRole: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: number;
  metadata?: Record<string, unknown> | null;
};

export type ListAuditEventsFilters = {
  actorUserId?: number;
  action?: string;
  entityType?: string;
  entityId?: number;
  from?: Date;
  to?: Date;
  limit: number;
  offset: number;
};

/**
 * Append-only write. Failures are logged and swallowed by callers
 * so business operations are never blocked by audit persistence.
 */
export const recordAuditEvent = async (
  input: RecordAuditEventInput
) => {
  return prisma.auditEvent.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      actorRole: input.actorRole.toUpperCase(),
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      ...(input.metadata
        ? { metadata: input.metadata as Prisma.InputJsonValue }
        : {}),
    },
  });
};

/** Fire-and-forget style helper used by domain services. */
export const safeRecordAuditEvent = async (
  input: RecordAuditEventInput
) => {
  try {
    await recordAuditEvent(input);
  } catch (error) {
    console.error("AUDIT_EVENT_RECORD_FAILED:", error);
  }
};

export const listAuditEvents = async (
  filters: ListAuditEventsFilters
) => {
  const where: Prisma.AuditEventWhereInput = {};

  if (filters.actorUserId !== undefined) {
    where.actorUserId = filters.actorUserId;
  }
  if (filters.action) {
    where.action = filters.action;
  }
  if (filters.entityType) {
    where.entityType = filters.entityType;
  }
  if (filters.entityId !== undefined) {
    where.entityId = filters.entityId;
  }
  if (filters.from || filters.to) {
    where.occurredAt = {};
    if (filters.from) {
      where.occurredAt.gte = filters.from;
    }
    if (filters.to) {
      where.occurredAt.lte = filters.to;
    }
  }

  const [total, data] = await Promise.all([
    prisma.auditEvent.count({ where }),
    prisma.auditEvent.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { occurredAt: "desc" },
      take: filters.limit,
      skip: filters.offset,
    }),
  ]);

  return {
    data,
    meta: {
      limit: filters.limit,
      offset: filters.offset,
      total,
    },
  };
};
