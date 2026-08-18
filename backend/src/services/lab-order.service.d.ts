export type LabTestOrderStatusValue = "REQUESTED" | "SAMPLE_COLLECTED" | "PROCESSING" | "RESULT_AVAILABLE" | "ACKNOWLEDGED" | "CANCELLED" | "REJECTED";
export type LabResultFlagValue = "NORMAL" | "ABNORMAL" | "CRITICAL";
export declare const stripResultForPatient: <T extends Record<string, unknown>>(order: T) => T;
export declare const createLabTestOrder: (input: {
    patientId: number;
    doctorId: number;
    testName: string;
    appointmentId?: number;
    notes?: string;
    orderedAt?: string;
    createdByUserId: number;
    role: string;
}) => Promise<{
    acknowledgedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
    appointment: {
        appointmentAt: Date;
        appointmentNo: string;
        doctorId: number;
        id: number;
        patientId: number;
        status: import("../generated/prisma/enums").AppointmentStatus;
    } | null;
    createdBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    };
    doctor: {
        doctorCode: string;
        firstName: string;
        id: number;
        lastName: string;
        specialization: string;
        status: import("../generated/prisma/enums").DoctorStatus;
    };
    patient: {
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
        status: import("../generated/prisma/enums").PatientStatus;
        userId: number | null;
    };
    resultDocument: {
        createdAt: Date;
        documentType: string;
        id: number;
        mimeType: string;
        originalName: string;
        size: number;
    } | null;
    resultUploadedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
} & {
    id: number;
    orderNo: string;
    patientId: number;
    doctorId: number;
    appointmentId: number | null;
    testName: string;
    status: import("../generated/prisma/enums").LabTestOrderStatus;
    orderedAt: Date;
    notes: string | null;
    createdByUserId: number;
    resultSummary: string | null;
    resultFlag: import("../generated/prisma/enums").LabResultFlag | null;
    resultOriginalName: string | null;
    resultStoredName: string | null;
    resultMimeType: string | null;
    resultSize: number | null;
    resultFilePath: string | null;
    resultUploadedAt: Date | null;
    resultUploadedByUserId: number | null;
    resultDocumentId: number | null;
    acknowledgedByUserId: number | null;
    acknowledgedAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const listLabTestOrders: (input: {
    role: string;
    actorUserId: number;
    status?: LabTestOrderStatusValue;
    patientId?: number;
    doctorId?: number;
}) => Promise<Record<string, unknown>[] | ({
    acknowledgedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
    appointment: {
        appointmentAt: Date;
        appointmentNo: string;
        doctorId: number;
        id: number;
        patientId: number;
        status: import("../generated/prisma/enums").AppointmentStatus;
    } | null;
    createdBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    };
    doctor: {
        doctorCode: string;
        firstName: string;
        id: number;
        lastName: string;
        specialization: string;
        status: import("../generated/prisma/enums").DoctorStatus;
    };
    patient: {
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
        status: import("../generated/prisma/enums").PatientStatus;
        userId: number | null;
    };
    resultDocument: {
        createdAt: Date;
        documentType: string;
        id: number;
        mimeType: string;
        originalName: string;
        size: number;
    } | null;
    resultUploadedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
} & {
    id: number;
    orderNo: string;
    patientId: number;
    doctorId: number;
    appointmentId: number | null;
    testName: string;
    status: import("../generated/prisma/enums").LabTestOrderStatus;
    orderedAt: Date;
    notes: string | null;
    createdByUserId: number;
    resultSummary: string | null;
    resultFlag: import("../generated/prisma/enums").LabResultFlag | null;
    resultOriginalName: string | null;
    resultStoredName: string | null;
    resultMimeType: string | null;
    resultSize: number | null;
    resultFilePath: string | null;
    resultUploadedAt: Date | null;
    resultUploadedByUserId: number | null;
    resultDocumentId: number | null;
    acknowledgedByUserId: number | null;
    acknowledgedAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare const getLabTestOrderById: (input: {
    id: number;
    role: string;
    actorUserId: number;
}) => Promise<Record<string, unknown> | ({
    acknowledgedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
    appointment: {
        appointmentAt: Date;
        appointmentNo: string;
        doctorId: number;
        id: number;
        patientId: number;
        status: import("../generated/prisma/enums").AppointmentStatus;
    } | null;
    createdBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    };
    doctor: {
        doctorCode: string;
        firstName: string;
        id: number;
        lastName: string;
        specialization: string;
        status: import("../generated/prisma/enums").DoctorStatus;
    };
    patient: {
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
        status: import("../generated/prisma/enums").PatientStatus;
        userId: number | null;
    };
    resultDocument: {
        createdAt: Date;
        documentType: string;
        id: number;
        mimeType: string;
        originalName: string;
        size: number;
    } | null;
    resultUploadedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
} & {
    id: number;
    orderNo: string;
    patientId: number;
    doctorId: number;
    appointmentId: number | null;
    testName: string;
    status: import("../generated/prisma/enums").LabTestOrderStatus;
    orderedAt: Date;
    notes: string | null;
    createdByUserId: number;
    resultSummary: string | null;
    resultFlag: import("../generated/prisma/enums").LabResultFlag | null;
    resultOriginalName: string | null;
    resultStoredName: string | null;
    resultMimeType: string | null;
    resultSize: number | null;
    resultFilePath: string | null;
    resultUploadedAt: Date | null;
    resultUploadedByUserId: number | null;
    resultDocumentId: number | null;
    acknowledgedByUserId: number | null;
    acknowledgedAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
})>;
export declare const updateLabTestOrderStatus: (input: {
    id: number;
    nextStatus: "SAMPLE_COLLECTED" | "PROCESSING" | "CANCELLED" | "REJECTED";
    rejectionReason?: string;
    actorUserId: number;
    role: string;
}) => Promise<{
    acknowledgedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
    appointment: {
        appointmentAt: Date;
        appointmentNo: string;
        doctorId: number;
        id: number;
        patientId: number;
        status: import("../generated/prisma/enums").AppointmentStatus;
    } | null;
    createdBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    };
    doctor: {
        doctorCode: string;
        firstName: string;
        id: number;
        lastName: string;
        specialization: string;
        status: import("../generated/prisma/enums").DoctorStatus;
    };
    patient: {
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
        status: import("../generated/prisma/enums").PatientStatus;
        userId: number | null;
    };
    resultDocument: {
        createdAt: Date;
        documentType: string;
        id: number;
        mimeType: string;
        originalName: string;
        size: number;
    } | null;
    resultUploadedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
} & {
    id: number;
    orderNo: string;
    patientId: number;
    doctorId: number;
    appointmentId: number | null;
    testName: string;
    status: import("../generated/prisma/enums").LabTestOrderStatus;
    orderedAt: Date;
    notes: string | null;
    createdByUserId: number;
    resultSummary: string | null;
    resultFlag: import("../generated/prisma/enums").LabResultFlag | null;
    resultOriginalName: string | null;
    resultStoredName: string | null;
    resultMimeType: string | null;
    resultSize: number | null;
    resultFilePath: string | null;
    resultUploadedAt: Date | null;
    resultUploadedByUserId: number | null;
    resultDocumentId: number | null;
    acknowledgedByUserId: number | null;
    acknowledgedAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const uploadLabTestResult: (input: {
    id: number;
    resultSummary: string;
    resultFlag: LabResultFlagValue;
    file?: {
        originalName: string;
        storedName: string;
        mimeType: string;
        size: number;
        filePath: string;
    };
    actorUserId: number;
    role: string;
}) => Promise<{
    acknowledgedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
    appointment: {
        appointmentAt: Date;
        appointmentNo: string;
        doctorId: number;
        id: number;
        patientId: number;
        status: import("../generated/prisma/enums").AppointmentStatus;
    } | null;
    createdBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    };
    doctor: {
        doctorCode: string;
        firstName: string;
        id: number;
        lastName: string;
        specialization: string;
        status: import("../generated/prisma/enums").DoctorStatus;
    };
    patient: {
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
        status: import("../generated/prisma/enums").PatientStatus;
        userId: number | null;
    };
    resultDocument: {
        createdAt: Date;
        documentType: string;
        id: number;
        mimeType: string;
        originalName: string;
        size: number;
    } | null;
    resultUploadedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
} & {
    id: number;
    orderNo: string;
    patientId: number;
    doctorId: number;
    appointmentId: number | null;
    testName: string;
    status: import("../generated/prisma/enums").LabTestOrderStatus;
    orderedAt: Date;
    notes: string | null;
    createdByUserId: number;
    resultSummary: string | null;
    resultFlag: import("../generated/prisma/enums").LabResultFlag | null;
    resultOriginalName: string | null;
    resultStoredName: string | null;
    resultMimeType: string | null;
    resultSize: number | null;
    resultFilePath: string | null;
    resultUploadedAt: Date | null;
    resultUploadedByUserId: number | null;
    resultDocumentId: number | null;
    acknowledgedByUserId: number | null;
    acknowledgedAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const acknowledgeLabTestOrder: (input: {
    id: number;
    actorUserId: number;
    role: string;
}) => Promise<{
    acknowledgedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
    appointment: {
        appointmentAt: Date;
        appointmentNo: string;
        doctorId: number;
        id: number;
        patientId: number;
        status: import("../generated/prisma/enums").AppointmentStatus;
    } | null;
    createdBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    };
    doctor: {
        doctorCode: string;
        firstName: string;
        id: number;
        lastName: string;
        specialization: string;
        status: import("../generated/prisma/enums").DoctorStatus;
    };
    patient: {
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
        status: import("../generated/prisma/enums").PatientStatus;
        userId: number | null;
    };
    resultDocument: {
        createdAt: Date;
        documentType: string;
        id: number;
        mimeType: string;
        originalName: string;
        size: number;
    } | null;
    resultUploadedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
} & {
    id: number;
    orderNo: string;
    patientId: number;
    doctorId: number;
    appointmentId: number | null;
    testName: string;
    status: import("../generated/prisma/enums").LabTestOrderStatus;
    orderedAt: Date;
    notes: string | null;
    createdByUserId: number;
    resultSummary: string | null;
    resultFlag: import("../generated/prisma/enums").LabResultFlag | null;
    resultOriginalName: string | null;
    resultStoredName: string | null;
    resultMimeType: string | null;
    resultSize: number | null;
    resultFilePath: string | null;
    resultUploadedAt: Date | null;
    resultUploadedByUserId: number | null;
    resultDocumentId: number | null;
    acknowledgedByUserId: number | null;
    acknowledgedAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getLabResultDownload: (input: {
    id: number;
    role: string;
    actorUserId: number;
}) => Promise<{
    filePath: string;
    originalName: string;
}>;
//# sourceMappingURL=lab-order.service.d.ts.map