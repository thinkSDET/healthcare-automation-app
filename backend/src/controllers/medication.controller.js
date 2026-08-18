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
exports.listMedicationMovements = exports.adjustMedicationStock = exports.updateMedication = exports.createMedication = exports.getMedicationById = exports.listMedications = void 0;
const medicationService = __importStar(require("../services/medication.service"));
const mapError = (error) => {
    if (!(error instanceof Error)) {
        return { status: 500, message: "Unexpected error" };
    }
    switch (error.message) {
        case "MEDICATION_NOT_FOUND":
            return { status: 404, message: "Medication not found" };
        case "DUPLICATE_SKU":
            return { status: 409, message: "A medication with this SKU already exists" };
        case "INVALID_QUANTITY":
            return { status: 400, message: "Quantity values must be non-negative integers" };
        case "INVALID_MEDICATION_FIELDS":
            return { status: 400, message: "SKU, name, and unit are required" };
        case "ADJUST_REASON_REQUIRED":
            return { status: 400, message: "Adjustment reason is required" };
        case "INVALID_DELTA":
            return { status: 400, message: "Delta must be a non-zero integer" };
        case "NEGATIVE_STOCK":
            return { status: 400, message: "Stock cannot become negative" };
        case "MEDICATION_INACTIVE":
            return { status: 400, message: "Medication is inactive" };
        case "CONCURRENT_STOCK_UPDATE":
            return {
                status: 409,
                message: "Stock was updated concurrently; please retry",
            };
        default:
            return { status: 500, message: "Failed to process medication request" };
    }
};
const requireUser = (req, res) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: "Authentication required",
        });
        return null;
    }
    return {
        actorUserId: req.user.userId,
        actorRole: req.user.role.toUpperCase(),
    };
};
const listMedications = async (req, res) => {
    try {
        const status = req.query.status
            ? String(req.query.status).toUpperCase()
            : undefined;
        const stockStatus = req.query.stockStatus
            ? String(req.query.stockStatus).toUpperCase()
            : undefined;
        const q = req.query.q ? String(req.query.q) : undefined;
        const filters = {};
        if (status === "ACTIVE" || status === "INACTIVE") {
            filters.status = status;
        }
        if (stockStatus === "IN_STOCK" ||
            stockStatus === "LOW_STOCK" ||
            stockStatus === "OUT_OF_STOCK") {
            filters.stockStatus = stockStatus;
        }
        if (q) {
            filters.q = q;
        }
        const data = await medicationService.listMedications(filters);
        return res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.error("LIST MEDICATIONS ERROR:", error);
        const mapped = mapError(error);
        return res.status(mapped.status).json({
            success: false,
            message: mapped.message,
        });
    }
};
exports.listMedications = listMedications;
const getMedicationById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid medication ID",
            });
        }
        const data = await medicationService.getMedicationById(id);
        return res.status(200).json({ success: true, data });
    }
    catch (error) {
        console.error("GET MEDICATION ERROR:", error);
        const mapped = mapError(error);
        return res.status(mapped.status).json({
            success: false,
            message: mapped.message,
        });
    }
};
exports.getMedicationById = getMedicationById;
const createMedication = async (req, res) => {
    try {
        const auditContext = requireUser(req, res);
        if (!auditContext) {
            return;
        }
        const data = await medicationService.createMedication(req.body, auditContext);
        return res.status(201).json({
            success: true,
            message: "Medication created",
            data,
        });
    }
    catch (error) {
        console.error("CREATE MEDICATION ERROR:", error);
        const mapped = mapError(error);
        return res.status(mapped.status).json({
            success: false,
            message: mapped.message,
        });
    }
};
exports.createMedication = createMedication;
const updateMedication = async (req, res) => {
    try {
        const auditContext = requireUser(req, res);
        if (!auditContext) {
            return;
        }
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid medication ID",
            });
        }
        const data = await medicationService.updateMedication(id, req.body, auditContext);
        return res.status(200).json({
            success: true,
            message: "Medication updated",
            data,
        });
    }
    catch (error) {
        console.error("UPDATE MEDICATION ERROR:", error);
        const mapped = mapError(error);
        return res.status(mapped.status).json({
            success: false,
            message: mapped.message,
        });
    }
};
exports.updateMedication = updateMedication;
const adjustMedicationStock = async (req, res) => {
    try {
        const auditContext = requireUser(req, res);
        if (!auditContext) {
            return;
        }
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid medication ID",
            });
        }
        const data = await medicationService.adjustMedicationStock(id, {
            delta: req.body.delta,
            reason: req.body.reason,
        }, auditContext);
        return res.status(200).json({
            success: true,
            message: "Stock adjusted",
            data,
        });
    }
    catch (error) {
        console.error("ADJUST MEDICATION STOCK ERROR:", error);
        const mapped = mapError(error);
        return res.status(mapped.status).json({
            success: false,
            message: mapped.message,
        });
    }
};
exports.adjustMedicationStock = adjustMedicationStock;
const listMedicationMovements = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid medication ID",
            });
        }
        const limitRaw = req.query.limit ? Number(req.query.limit) : 50;
        const offsetRaw = req.query.offset ? Number(req.query.offset) : 0;
        const limit = Number.isInteger(limitRaw) && limitRaw >= 1 && limitRaw <= 100
            ? limitRaw
            : 50;
        const offset = Number.isInteger(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0;
        const result = await medicationService.listMedicationMovements(id, {
            limit,
            offset,
        });
        return res.status(200).json({
            success: true,
            data: result.data,
            meta: result.meta,
        });
    }
    catch (error) {
        console.error("LIST MEDICATION MOVEMENTS ERROR:", error);
        const mapped = mapError(error);
        return res.status(mapped.status).json({
            success: false,
            message: mapped.message,
        });
    }
};
exports.listMedicationMovements = listMedicationMovements;
//# sourceMappingURL=medication.controller.js.map