export declare const getDependents: (patientId: number) => Promise<{
    id: number;
    patientId: number;
    firstName: string;
    lastName: string;
    relationship: string;
    dateOfBirth: Date | null;
    gender: import("../generated/prisma/enums").Gender | null;
    phone: string | null;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare const createDependent: (patientId: number, data: {
    firstName: string;
    lastName: string;
    relationship: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    email?: string;
}) => Promise<{
    id: number;
    patientId: number;
    firstName: string;
    lastName: string;
    relationship: string;
    dateOfBirth: Date | null;
    gender: import("../generated/prisma/enums").Gender | null;
    phone: string | null;
    email: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const deleteDependent: (dependentId: number) => Promise<{
    message: string;
}>;
//# sourceMappingURL=patient-dependent.service.d.ts.map