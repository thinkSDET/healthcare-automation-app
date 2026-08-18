import { z } from "zod";
export declare const auditActionEnum: z.ZodEnum<{
    APPROVE: "APPROVE";
    CANCEL: "CANCEL";
    CREATE: "CREATE";
    DELETE: "DELETE";
    REJECT: "REJECT";
    STATUS_CHANGE: "STATUS_CHANGE";
    UPDATE: "UPDATE";
}>;
export declare const auditEntityTypeEnum: z.ZodEnum<{
    APPOINTMENT: "APPOINTMENT";
    APPOINTMENT_REQUEST: "APPOINTMENT_REQUEST";
    LAB_TEST_ORDER: "LAB_TEST_ORDER";
    MEDICATION: "MEDICATION";
    ORDER: "ORDER";
    PATIENT: "PATIENT";
    PRESCRIPTION: "PRESCRIPTION";
    REFILL_REQUEST: "REFILL_REQUEST";
    REPLENISHMENT_REQUEST: "REPLENISHMENT_REQUEST";
}>;
export declare const listAuditEventsQuerySchema: z.ZodObject<{
    actorUserId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    action: z.ZodOptional<z.ZodEnum<{
        APPROVE: "APPROVE";
        CANCEL: "CANCEL";
        CREATE: "CREATE";
        DELETE: "DELETE";
        REJECT: "REJECT";
        STATUS_CHANGE: "STATUS_CHANGE";
        UPDATE: "UPDATE";
    }>>;
    entityType: z.ZodOptional<z.ZodEnum<{
        APPOINTMENT: "APPOINTMENT";
        APPOINTMENT_REQUEST: "APPOINTMENT_REQUEST";
        LAB_TEST_ORDER: "LAB_TEST_ORDER";
        MEDICATION: "MEDICATION";
        ORDER: "ORDER";
        PATIENT: "PATIENT";
        PRESCRIPTION: "PRESCRIPTION";
        REFILL_REQUEST: "REFILL_REQUEST";
        REPLENISHMENT_REQUEST: "REPLENISHMENT_REQUEST";
    }>>;
    entityId: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
//# sourceMappingURL=audit.validator.d.ts.map