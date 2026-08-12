/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { prisma } from "../config/prisma";

export const getDocuments = async (
  patientId: number
) => {
  const patient =
    await prisma.patient.findUnique({
      where: {
        id: patientId,
      },
    });

  if (!patient) {
    throw new Error(
      "PATIENT_NOT_FOUND"
    );
  }

  return prisma.patientDocument.findMany({
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

export const createDocument = async (
  patientId: number,
  data: {
    originalName: string;
    storedName: string;
    documentType: string;
    mimeType: string;
    size: number;
    filePath: string;
  }
) => {
  const patient =
    await prisma.patient.findUnique({
      where: {
        id: patientId,
      },
    });

  if (!patient) {
    throw new Error(
      "PATIENT_NOT_FOUND"
    );
  }

  return prisma.patientDocument.create({
    data: {
      patientId,
      originalName:
        data.originalName,
      storedName:
        data.storedName,
      documentType:
        data.documentType,
      mimeType:
        data.mimeType,
      size: data.size,
      filePath:
        data.filePath,
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

export const getDocumentById = async (
  patientId: number,
  documentId: number
) => {
  return prisma.patientDocument.findFirst({
    where: {
      id: documentId,
      patientId,
    },
  });
};

export const deleteDocument = async (
  patientId: number,
  documentId: number
) => {
  const document =
    await prisma.patientDocument.findFirst({
      where: {
        id: documentId,
        patientId,
      },
    });

  if (!document) {
    throw new Error(
      "DOCUMENT_NOT_FOUND"
    );
  }

  await prisma.patientDocument.delete({
    where: {
      id: documentId,
    },
  });

  return document;
};