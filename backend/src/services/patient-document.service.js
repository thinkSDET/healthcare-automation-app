"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.getDocumentById = exports.createDocument = exports.getDocuments = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const prisma_1 = require("../config/prisma");
const getDocuments = async (patientId) => {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: {
            id: patientId,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.patientDocument.findMany({
        where: {
            patientId,
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            originalName: true,
            documentType: true,
            mimeType: true,
            size: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};
exports.getDocuments = getDocuments;
const createDocument = async (patientId, data) => {
    const patient = await prisma_1.prisma.patient.findUnique({
        where: {
            id: patientId,
        },
    });
    if (!patient) {
        throw new Error("PATIENT_NOT_FOUND");
    }
    return prisma_1.prisma.patientDocument.create({
        data: {
            patientId,
            originalName: data.originalName,
            storedName: data.storedName,
            documentType: data.documentType,
            mimeType: data.mimeType,
            size: data.size,
            filePath: data.filePath,
        },
        select: {
            id: true,
            originalName: true,
            documentType: true,
            mimeType: true,
            size: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};
exports.createDocument = createDocument;
const getDocumentById = async (patientId, documentId) => {
    return prisma_1.prisma.patientDocument.findFirst({
        where: {
            id: documentId,
            patientId,
        },
    });
};
exports.getDocumentById = getDocumentById;
const deleteDocument = async (patientId, documentId) => {
    const document = await prisma_1.prisma.patientDocument.findFirst({
        where: {
            id: documentId,
            patientId,
        },
    });
    if (!document) {
        throw new Error("DOCUMENT_NOT_FOUND");
    }
    await prisma_1.prisma.patientDocument.delete({
        where: {
            id: documentId,
        },
    });
    return document;
};
exports.deleteDocument = deleteDocument;
//# sourceMappingURL=patient-document.service.js.map