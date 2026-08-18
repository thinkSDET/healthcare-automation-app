"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAuditEventsQuerySchema = exports.auditEntityTypeEnum = exports.auditActionEnum = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const zod_1 = require("zod");
exports.auditActionEnum = zod_1.z.enum([
    "CREATE",
    "UPDATE",
    "STATUS_CHANGE",
    "APPROVE",
    "REJECT",
    "CANCEL",
    "DELETE",
]);
exports.auditEntityTypeEnum = zod_1.z.enum([
    "PATIENT",
    "APPOINTMENT",
    "APPOINTMENT_REQUEST",
    "PRESCRIPTION",
    "REFILL_REQUEST",
    "ORDER",
    "MEDICATION",
    "REPLENISHMENT_REQUEST",
    "LAB_TEST_ORDER",
]);
exports.listAuditEventsQuerySchema = zod_1.z.object({
    actorUserId: zod_1.z.coerce.number().int().positive().optional(),
    action: exports.auditActionEnum.optional(),
    entityType: exports.auditEntityTypeEnum.optional(),
    entityId: zod_1.z.coerce.number().int().positive().optional(),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
    offset: zod_1.z.coerce.number().int().min(0).optional(),
});
//# sourceMappingURL=audit.validator.js.map