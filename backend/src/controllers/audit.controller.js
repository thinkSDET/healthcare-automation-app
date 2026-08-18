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
exports.listAuditEvents = void 0;
const auditService = __importStar(require("../services/audit.service"));
const audit_validator_1 = require("../validators/audit.validator");
const listAuditEvents = async (req, res) => {
    try {
        const parsed = audit_validator_1.listAuditEventsQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: parsed.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
        }
        const { actorUserId, action, entityType, entityId, from, to, limit = 50, offset = 0, } = parsed.data;
        const fromDate = from ? new Date(from) : undefined;
        const toDate = to ? new Date(to) : undefined;
        if (fromDate && Number.isNaN(fromDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid from date",
            });
        }
        if (toDate && Number.isNaN(toDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid to date",
            });
        }
        const filters = {
            limit,
            offset,
        };
        if (actorUserId !== undefined) {
            filters.actorUserId = actorUserId;
        }
        if (action) {
            filters.action = action;
        }
        if (entityType) {
            filters.entityType = entityType;
        }
        if (entityId !== undefined) {
            filters.entityId = entityId;
        }
        if (fromDate) {
            filters.from = fromDate;
        }
        if (toDate) {
            filters.to = toDate;
        }
        const result = await auditService.listAuditEvents(filters);
        return res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta,
        });
    }
    catch (error) {
        console.error("LIST AUDIT EVENTS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch audit events",
        });
    }
};
exports.listAuditEvents = listAuditEvents;
//# sourceMappingURL=audit.controller.js.map