interface PrescriptionItemInput {
    medicineName: string;
    dosage: string;
    frequency: string;
    duration: string;
    route?: string;
    instructions?: string;
}
interface CreatePrescriptionInput {
    patientId: number;
    doctorId: number;
    prescribedAt?: string;
    diagnosis?: string;
    notes?: string;
    status?: "ACTIVE" | "COMPLETED" | "CANCELLED";
    items: PrescriptionItemInput[];
}
export declare const getPatientPrescriptions: (patientId: number) => Promise<({
    doctor: {
        doctorCode: string;
        firstName: string;
        id: number;
        lastName: string;
        specialization: string;
    };
    items: {
        id: number;
        prescriptionId: number;
        medicineName: string;
        dosage: string;
        frequency: string;
        duration: string;
        route: string | null;
        instructions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[];
} & {
    id: number;
    prescriptionNo: string;
    patientId: number;
    doctorId: number;
    prescribedAt: Date;
    diagnosis: string | null;
    notes: string | null;
    status: import("../generated/prisma/enums").PrescriptionStatus;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare const getPrescriptionById: (prescriptionId: number) => Promise<{
    doctor: {
        doctorCode: string;
        firstName: string;
        id: number;
        lastName: string;
        licenseNumber: string;
        specialization: string;
    };
    items: {
        id: number;
        prescriptionId: number;
        medicineName: string;
        dosage: string;
        frequency: string;
        duration: string;
        route: string | null;
        instructions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[];
    patient: {
        dateOfBirth: Date;
        firstName: string;
        gender: import("../generated/prisma/enums").Gender;
        id: number;
        lastName: string;
        medicalId: string;
    };
} & {
    id: number;
    prescriptionNo: string;
    patientId: number;
    doctorId: number;
    prescribedAt: Date;
    diagnosis: string | null;
    notes: string | null;
    status: import("../generated/prisma/enums").PrescriptionStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const createPrescription: (data: CreatePrescriptionInput) => Promise<{
    doctor: {
        doctorCode: string;
        firstName: string;
        id: number;
        lastName: string;
        specialization: string;
    };
    items: {
        id: number;
        prescriptionId: number;
        medicineName: string;
        dosage: string;
        frequency: string;
        duration: string;
        route: string | null;
        instructions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[];
    patient: {
        firstName: string;
        id: number;
        lastName: string;
        medicalId: string;
    };
} & {
    id: number;
    prescriptionNo: string;
    patientId: number;
    doctorId: number;
    prescribedAt: Date;
    diagnosis: string | null;
    notes: string | null;
    status: import("../generated/prisma/enums").PrescriptionStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updatePrescriptionStatus: (prescriptionId: number, status: "ACTIVE" | "COMPLETED" | "CANCELLED") => Promise<{
    doctor: {
        doctorCode: string;
        firstName: string;
        id: number;
        lastName: string;
        specialization: string;
    };
    items: {
        id: number;
        prescriptionId: number;
        medicineName: string;
        dosage: string;
        frequency: string;
        duration: string;
        route: string | null;
        instructions: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[];
} & {
    id: number;
    prescriptionNo: string;
    patientId: number;
    doctorId: number;
    prescribedAt: Date;
    diagnosis: string | null;
    notes: string | null;
    status: import("../generated/prisma/enums").PrescriptionStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const deletePrescription: (prescriptionId: number) => Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=prescription.service.d.ts.map