export type AuditAction = "CREATE" | "UPDATE" | "STATUS_CHANGE" | "APPROVE" | "REJECT" | "CANCEL" | "DELETE";
export type AuditEntityType = "PATIENT" | "APPOINTMENT" | "APPOINTMENT_REQUEST" | "PRESCRIPTION" | "REFILL_REQUEST" | "ORDER" | "MEDICATION" | "REPLENISHMENT_REQUEST" | "LAB_TEST_ORDER";
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
export declare const recordAuditEvent: (input: RecordAuditEventInput) => Promise<{
    id: number;
    occurredAt: Date;
    actorUserId: number | null;
    actorRole: string;
    action: string;
    entityType: string;
    entityId: number;
    metadata: import("@prisma/client/runtime/client").JsonValue | null;
}>;
/** Fire-and-forget style helper used by domain services. */
export declare const safeRecordAuditEvent: (input: RecordAuditEventInput) => Promise<void>;
export declare const listAuditEvents: (filters: ListAuditEventsFilters) => Promise<{
    data: ({
        actor: {
            email: string;
            firstName: string;
            id: number;
            lastName: string;
            role: import("../generated/prisma/enums").UserRole;
        } | null;
    } & {
        id: number;
        occurredAt: Date;
        actorUserId: number | null;
        actorRole: string;
        action: string;
        entityType: string;
        entityId: number;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
    })[];
    meta: {
        limit: number;
        offset: number;
        total: number;
    };
}>;
//# sourceMappingURL=audit.service.d.ts.map