import { z } from "zod";

export const auditActionEnum = z.enum([
  "CREATE",
  "UPDATE",
  "STATUS_CHANGE",
  "APPROVE",
  "REJECT",
  "CANCEL",
  "DELETE",
]);

export const auditEntityTypeEnum = z.enum([
  "PATIENT",
  "APPOINTMENT",
  "APPOINTMENT_REQUEST",
  "PRESCRIPTION",
  "REFILL_REQUEST",
  "ORDER",
  "MEDICATION",
  "REPLENISHMENT_REQUEST",
]);

export const listAuditEventsQuerySchema = z.object({
  actorUserId: z.coerce.number().int().positive().optional(),
  action: auditActionEnum.optional(),
  entityType: auditEntityTypeEnum.optional(),
  entityId: z.coerce.number().int().positive().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
