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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePatientDocument = exports.downloadPatientDocument = exports.uploadPatientDocument = exports.getPatientDocuments = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const patientDocumentService = __importStar(require("../services/patient-document.service"));
const getPatientDocuments = async (req, res) => {
    try {
        const patientId = Number(req.params.id);
        if (Number.isNaN(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }
        const documents = await patientDocumentService
            .getDocuments(patientId);
        return res.status(200).json({
            success: true,
            data: documents,
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        console.error("GET DOCUMENTS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch patient documents",
        });
    }
};
exports.getPatientDocuments = getPatientDocuments;
const uploadPatientDocument = async (req, res) => {
    try {
        const patientId = Number(req.params.id);
        if (Number.isNaN(patientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient ID",
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Document file is required",
            });
        }
        const documentType = String(req.body.documentType || "").trim();
        if (!documentType) {
            if (fs_1.default.existsSync(req.file.path)) {
                fs_1.default.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: "Document type is required",
            });
        }
        const document = await patientDocumentService
            .createDocument(patientId, {
            originalName: req.file.originalname,
            storedName: req.file.filename,
            documentType,
            mimeType: req.file.mimetype,
            size: req.file.size,
            filePath: req.file.path,
        });
        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            data: document,
        });
    }
    catch (error) {
        if (req.file?.path &&
            fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        if (error instanceof Error &&
            error.message ===
                "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Patient not found",
            });
        }
        console.error("UPLOAD DOCUMENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to upload document",
        });
    }
};
exports.uploadPatientDocument = uploadPatientDocument;
const downloadPatientDocument = async (req, res) => {
    try {
        const patientId = Number(req.params.id);
        const documentId = Number(req.params.documentId);
        if (Number.isNaN(patientId) ||
            Number.isNaN(documentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient or document ID",
            });
        }
        const document = await patientDocumentService
            .getDocumentById(patientId, documentId);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }
        if (!fs_1.default.existsSync(document.filePath)) {
            return res.status(404).json({
                success: false,
                message: "Document file not found",
            });
        }
        return res.download(path_1.default.resolve(document.filePath), document.originalName);
    }
    catch (error) {
        console.error("DOWNLOAD DOCUMENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to download document",
        });
    }
};
exports.downloadPatientDocument = downloadPatientDocument;
const deletePatientDocument = async (req, res) => {
    try {
        const patientId = Number(req.params.id);
        const documentId = Number(req.params.documentId);
        if (Number.isNaN(patientId) ||
            Number.isNaN(documentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid patient or document ID",
            });
        }
        const document = await patientDocumentService
            .deleteDocument(patientId, documentId);
        if (document.filePath &&
            fs_1.default.existsSync(document.filePath)) {
            fs_1.default.unlinkSync(document.filePath);
        }
        return res.status(200).json({
            success: true,
            message: "Document deleted successfully",
        });
    }
    catch (error) {
        if (error instanceof Error &&
            error.message ===
                "DOCUMENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }
        console.error("DELETE DOCUMENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete document",
        });
    }
};
exports.deletePatientDocument = deletePatientDocument;
//# sourceMappingURL=patient-document.controller.js.map