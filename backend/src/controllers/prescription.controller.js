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
exports.deletePrescription = exports.updatePrescriptionStatus = exports.createPrescription = exports.getPrescriptionById = exports.getPatientPrescriptions = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const prescriptionService = __importStar(require("../services/prescription.service"));
const getOwnPatientId = async (userId) => {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: { userId },
        select: { id: true },
    });
    return patient?.id ?? null;
};
const assertPatientOwnsPatientId = async (req, patientId) => {
    if (req.user?.role?.toUpperCase() !== "PATIENT") {
        return null;
    }
    const ownPatientId = await getOwnPatientId(req.user.userId);
    if (!ownPatientId) {
        return {
            status: 403,
            message: "No patient record is linked to this account",
        };
    }
    if (ownPatientId !== patientId) {
        return {
            status: 403,
            message: "You do not have permission to access prescriptions for this patient",
        };
    }
    return null;
};
/*
|--------------------------------------------------------------------------
| Get Patient Prescriptions
|--------------------------------------------------------------------------
*/
const getPatientPrescriptions = async (req, res) => {
    try {
        const patientId = Number(req.params.patientId);
        if (Number.isNaN(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }
        const ownershipError = await assertPatientOwnsPatientId(req, patientId);
        if (ownershipError) {
            return res.status(ownershipError.status).json({
                success: false,
                message: ownershipError.message,
            });
        }
        const prescriptions = await prescriptionService
            .getPatientPrescriptions(patientId);
        return res.status(200).json({
            success: true,
            data: prescriptions,
        });
    }
    catch (error) {
        console.error("GET PATIENT PRESCRIPTIONS ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to fetch prescriptions",
        });
    }
};
exports.getPatientPrescriptions = getPatientPrescriptions;
/*
|--------------------------------------------------------------------------
| Get Prescription
|--------------------------------------------------------------------------
*/
const getPrescriptionById = async (req, res) => {
    try {
        const prescriptionId = Number(req.params.id);
        if (Number.isNaN(prescriptionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid prescription ID",
            });
        }
        const prescription = await prescriptionService
            .getPrescriptionById(prescriptionId);
        const ownershipError = await assertPatientOwnsPatientId(req, prescription.patientId);
        if (ownershipError) {
            return res.status(ownershipError.status).json({
                success: false,
                message: ownershipError.message,
            });
        }
        return res.status(200).json({
            success: true,
            data: prescription,
        });
    }
    catch (error) {
        console.error("GET PRESCRIPTION ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "PRESCRIPTION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Prescription not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to fetch prescription",
        });
    }
};
exports.getPrescriptionById = getPrescriptionById;
/*
|--------------------------------------------------------------------------
| Create Prescription
|--------------------------------------------------------------------------
*/
const createPrescription = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const { patientId, doctorId, prescribedAt, diagnosis, notes, status, items, } = req.body;
        if (!patientId ||
            !doctorId) {
            return res.status(400).json({
                success: false,
                message: "Patient and doctor are required",
            });
        }
        if (!Array.isArray(items) ||
            items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one medicine is required",
            });
        }
        const prescription = await prescriptionService
            .createPrescription({
            patientId: Number(patientId),
            doctorId: Number(doctorId),
            prescribedAt,
            diagnosis,
            notes,
            status,
            items,
        }, {
            actorUserId: req.user.userId,
            actorRole: req.user.role,
        });
        return res.status(201).json({
            success: true,
            message: "Prescription created successfully",
            data: prescription,
        });
    }
    catch (error) {
        console.error("CREATE PRESCRIPTION ERROR:", error);
        if (error instanceof Error) {
            switch (error.message) {
                case "PATIENT_NOT_FOUND":
                    return res.status(404).json({
                        success: false,
                        message: "Patient not found",
                    });
                case "DOCTOR_NOT_FOUND":
                    return res.status(404).json({
                        success: false,
                        message: "Doctor not found",
                    });
                case "PRESCRIPTION_ITEMS_REQUIRED":
                    return res.status(400).json({
                        success: false,
                        message: "At least one medicine is required",
                    });
                case "INVALID_PRESCRIPTION_ITEM":
                    return res.status(400).json({
                        success: false,
                        message: "Medicine name, dosage, frequency and duration are required for every medicine",
                    });
            }
        }
        return res.status(500).json({
            success: false,
            message: "Failed to create prescription",
        });
    }
};
exports.createPrescription = createPrescription;
/*
|--------------------------------------------------------------------------
| Update Prescription Status
|--------------------------------------------------------------------------
*/
const updatePrescriptionStatus = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const prescriptionId = Number(req.params.id);
        const { status, } = req.body;
        if (Number.isNaN(prescriptionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid prescription ID",
            });
        }
        if (![
            "ACTIVE",
            "COMPLETED",
            "CANCELLED",
        ].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid prescription status",
            });
        }
        const prescription = await prescriptionService
            .updatePrescriptionStatus(prescriptionId, status, {
            actorUserId: req.user.userId,
            actorRole: req.user.role,
        });
        return res.status(200).json({
            success: true,
            message: "Prescription status updated successfully",
            data: prescription,
        });
    }
    catch (error) {
        console.error("UPDATE PRESCRIPTION STATUS ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "PRESCRIPTION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Prescription not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to update prescription status",
        });
    }
};
exports.updatePrescriptionStatus = updatePrescriptionStatus;
/*
|--------------------------------------------------------------------------
| Delete Prescription
|--------------------------------------------------------------------------
*/
const deletePrescription = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const prescriptionId = Number(req.params.id);
        if (Number.isNaN(prescriptionId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid prescription ID",
            });
        }
        const result = await prescriptionService
            .deletePrescription(prescriptionId, {
            actorUserId: req.user.userId,
            actorRole: req.user.role,
        });
        return res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        console.error("DELETE PRESCRIPTION ERROR:", error);
        if (error instanceof Error &&
            error.message ===
                "PRESCRIPTION_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Prescription not found",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to delete prescription",
        });
    }
};
exports.deletePrescription = deletePrescription;
//# sourceMappingURL=prescription.controller.js.map