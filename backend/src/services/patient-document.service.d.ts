export declare const getDocuments: (patientId: number) => Promise<{
    createdAt: Date;
    documentType: string;
    id: number;
    mimeType: string;
    originalName: string;
    size: number;
    updatedAt: Date;
}[]>;
export declare const createDocument: (patientId: number, data: {
    originalName: string;
    storedName: string;
    documentType: string;
    mimeType: string;
    size: number;
    filePath: string;
}) => Promise<{
    createdAt: Date;
    documentType: string;
    id: number;
    mimeType: string;
    originalName: string;
    size: number;
    updatedAt: Date;
}>;
export declare const getDocumentById: (patientId: number, documentId: number) => Promise<{
    id: number;
    patientId: number;
    originalName: string;
    storedName: string;
    documentType: string;
    mimeType: string;
    size: number;
    filePath: string;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare const deleteDocument: (patientId: number, documentId: number) => Promise<{
    id: number;
    patientId: number;
    originalName: string;
    storedName: string;
    documentType: string;
    mimeType: string;
    size: number;
    filePath: string;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=patient-document.service.d.ts.map