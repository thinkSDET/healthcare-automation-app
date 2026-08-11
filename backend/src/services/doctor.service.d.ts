export declare const getDoctors: () => Promise<{
    id: number;
    doctorCode: string;
    firstName: string;
    lastName: string;
    specialization: string;
    licenseNumber: string;
    email: string;
    phone: string;
    experience: number;
    status: import("../generated/prisma/enums").DoctorStatus;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare const getDoctorById: (id: number) => Promise<{
    id: number;
    doctorCode: string;
    firstName: string;
    lastName: string;
    specialization: string;
    licenseNumber: string;
    email: string;
    phone: string;
    experience: number;
    status: import("../generated/prisma/enums").DoctorStatus;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare const createDoctor: (data: {
    doctorCode: string;
    firstName: string;
    lastName: string;
    specialization: string;
    licenseNumber: string;
    email: string;
    phone: string;
    experience: number;
}) => Promise<{
    id: number;
    doctorCode: string;
    firstName: string;
    lastName: string;
    specialization: string;
    licenseNumber: string;
    email: string;
    phone: string;
    experience: number;
    status: import("../generated/prisma/enums").DoctorStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateDoctor: (id: number, data: {
    firstName?: string;
    lastName?: string;
    specialization?: string;
    phone?: string;
    experience?: number;
    status?: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
}) => Promise<{
    id: number;
    doctorCode: string;
    firstName: string;
    lastName: string;
    specialization: string;
    licenseNumber: string;
    email: string;
    phone: string;
    experience: number;
    status: import("../generated/prisma/enums").DoctorStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const deleteDoctor: (id: number) => Promise<{
    id: number;
    doctorCode: string;
    firstName: string;
    lastName: string;
    specialization: string;
    licenseNumber: string;
    email: string;
    phone: string;
    experience: number;
    status: import("../generated/prisma/enums").DoctorStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=doctor.service.d.ts.map