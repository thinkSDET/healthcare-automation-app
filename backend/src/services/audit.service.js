"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAuditEvents = exports.safeRecordAuditEvent = exports.recordAuditEvent = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const prisma_1 = require("../config/prisma");
/**
 * Append-only write. Failures are logged and swallowed by callers
 * so business operations are never blocked by audit persistence.
 */
const recordAuditEvent = async (input) => {
    return prisma_1.prisma.auditEvent.create({
        data: {
            actorUserId: input.actorUserId ?? null,
            actorRole: input.actorRole.toUpperCase(),
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId,
            ...(input.metadata
                ? { metadata: input.metadata }
                : {}),
        },
    });
};
exports.recordAuditEvent = recordAuditEvent;
/** Fire-and-forget style helper used by domain services. */
const safeRecordAuditEvent = async (input) => {
    try {
        await (0, exports.recordAuditEvent)(input);
    }
    catch (error) {
        console.error("AUDIT_EVENT_RECORD_FAILED:", error);
    }
};
exports.safeRecordAuditEvent = safeRecordAuditEvent;
const listAuditEvents = async (filters) => {
    const where = {};
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
        prisma_1.prisma.auditEvent.count({ where }),
        prisma_1.prisma.auditEvent.findMany({
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
exports.listAuditEvents = listAuditEvents;
//# sourceMappingURL=audit.service.js.map