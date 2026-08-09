import { Response } from "express";
import path from "path";
import fs from "fs";

import { AuthRequest } from "../middleware/auth";

import * as patientDocumentService
  from "../services/patient-document.service";

export const getPatientDocuments =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const patientId =
        Number(req.params.id);

      if (Number.isNaN(patientId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid patient ID",
        });
      }

      const documents =
        await patientDocumentService
          .getDocuments(patientId);

      return res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "PATIENT_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      console.error(
        "GET DOCUMENTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch patient documents",
      });
    }
  };

export const uploadPatientDocument =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const patientId =
        Number(req.params.id);

      if (Number.isNaN(patientId)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid patient ID",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Document file is required",
        });
      }

      const documentType =
        String(
          req.body.documentType || ""
        ).trim();

      if (!documentType) {
        if (
          fs.existsSync(
            req.file.path
          )
        ) {
          fs.unlinkSync(
            req.file.path
          );
        }

        return res.status(400).json({
          success: false,
          message:
            "Document type is required",
        });
      }

      const document =
        await patientDocumentService
          .createDocument(
            patientId,
            {
              originalName:
                req.file.originalname,
              storedName:
                req.file.filename,
              documentType,
              mimeType:
                req.file.mimetype,
              size:
                req.file.size,
              filePath:
                req.file.path,
            }
          );

      return res.status(201).json({
        success: true,
        message:
          "Document uploaded successfully",
        data: document,
      });
    } catch (error) {
      if (
        req.file?.path &&
        fs.existsSync(req.file.path)
      ) {
        fs.unlinkSync(
          req.file.path
        );
      }

      if (
        error instanceof Error &&
        error.message ===
          "PATIENT_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      console.error(
        "UPLOAD DOCUMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to upload document",
      });
    }
  };

export const downloadPatientDocument =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const patientId =
        Number(req.params.id);

      const documentId =
        Number(
          req.params.documentId
        );

      if (
        Number.isNaN(patientId) ||
        Number.isNaN(documentId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid patient or document ID",
        });
      }

      const document =
        await patientDocumentService
          .getDocumentById(
            patientId,
            documentId
          );

      if (!document) {
        return res.status(404).json({
          success: false,
          message:
            "Document not found",
        });
      }

      if (
        !fs.existsSync(
          document.filePath
        )
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Document file not found",
        });
      }

      return res.download(
        path.resolve(
          document.filePath
        ),
        document.originalName
      );
    } catch (error) {
      console.error(
        "DOWNLOAD DOCUMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to download document",
      });
    }
  };

export const deletePatientDocument =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const patientId =
        Number(req.params.id);

      const documentId =
        Number(
          req.params.documentId
        );

      if (
        Number.isNaN(patientId) ||
        Number.isNaN(documentId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid patient or document ID",
        });
      }

      const document =
        await patientDocumentService
          .deleteDocument(
            patientId,
            documentId
          );

      if (
        document.filePath &&
        fs.existsSync(
          document.filePath
        )
      ) {
        fs.unlinkSync(
          document.filePath
        );
      }

      return res.status(200).json({
        success: true,
        message:
          "Document deleted successfully",
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "DOCUMENT_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Document not found",
        });
      }

      console.error(
        "DELETE DOCUMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete document",
      });
    }
  };