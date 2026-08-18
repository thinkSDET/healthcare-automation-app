export type AppointmentRequestStatusValue = "SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED";
export declare const createAppointmentRequest: (input: {
    doctorId: number;
    requestedAt: Date;
    duration?: number;
    type?: "IN_PERSON" | "VIDEO" | "PHONE";
    reason: string;
    notes?: string;
    requestedByUserId: number;
    role: string;
    ownPatientId: number | null;
}) => Promise<{
    appointment: {
        appointmentAt: Date;
        appointmentNo: string;
        duration: number;
        id: number;
        status: import("../generated/prisma/enums").AppointmentStatus;
    } | null;
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
    requestedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    };
    reviewedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
} & {
    id: number;
    requestNo: string;
    patientId: number;
    doctorId: number;
    requestedAt: Date;
    duration: number;
    type: import("../generated/prisma/enums").AppointmentType;
    reason: string;
    notes: string | null;
    status: import("../generated/prisma/enums").AppointmentRequestStatus;
    requestedByUserId: number;
    reviewedByUserId: number | null;
    rejectionReason: string | null;
    reviewedAt: Date | null;
    appointmentId: number | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const listAppointmentRequests: (filters: {
    role: string;
    ownPatientId: number | null;
    status?: AppointmentRequestStatusValue;
    doctorId?: number;
    patientId?: number;
}) => Promise<({
    appointment: {
        appointmentAt: Date;
        appointmentNo: string;
        duration: number;
        id: number;
        status: import("../generated/prisma/enums").AppointmentStatus;
    } | null;
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
    requestedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    };
    reviewedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
} & {
    id: number;
    requestNo: string;
    patientId: number;
    doctorId: number;
    requestedAt: Date;
    duration: number;
    type: import("../generated/prisma/enums").AppointmentType;
    reason: string;
    notes: string | null;
    status: import("../generated/prisma/enums").AppointmentRequestStatus;
    requestedByUserId: number;
    reviewedByUserId: number | null;
    rejectionReason: string | null;
    reviewedAt: Date | null;
    appointmentId: number | null;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare const getAppointmentRequestById: (id: number, access: {
    role: string;
    ownPatientId: number | null;
}) => Promise<{
    appointment: {
        appointmentAt: Date;
        appointmentNo: string;
        duration: number;
        id: number;
        status: import("../generated/prisma/enums").AppointmentStatus;
    } | null;
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
    requestedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    };
    reviewedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
} & {
    id: number;
    requestNo: string;
    patientId: number;
    doctorId: number;
    requestedAt: Date;
    duration: number;
    type: import("../generated/prisma/enums").AppointmentType;
    reason: string;
    notes: string | null;
    status: import("../generated/prisma/enums").AppointmentRequestStatus;
    requestedByUserId: number;
    reviewedByUserId: number | null;
    rejectionReason: string | null;
    reviewedAt: Date | null;
    appointmentId: number | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateAppointmentRequestStatus: (input: {
    id: number;
    nextStatus: "APPROVED" | "REJECTED" | "CANCELLED";
    rejectionReason?: string;
    actorUserId: number;
    role: string;
    ownPatientId: number | null;
}) => Promise<{
    appointment: {
        appointmentAt: Date;
        appointmentNo: string;
        duration: number;
        id: number;
        status: import("../generated/prisma/enums").AppointmentStatus;
    } | null;
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
    requestedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    };
    reviewedBy: {
        email: string;
        firstName: string;
        id: number;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
    } | null;
} & {
    id: number;
    requestNo: string;
    patientId: number;
    doctorId: number;
    requestedAt: Date;
    duration: number;
    type: import("../generated/prisma/enums").AppointmentType;
    reason: string;
    notes: string | null;
    status: import("../generated/prisma/enums").AppointmentRequestStatus;
    requestedByUserId: number;
    reviewedByUserId: number | null;
    rejectionReason: string | null;
    reviewedAt: Date | null;
    appointmentId: number | null;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=appointment-request.service.d.ts.map