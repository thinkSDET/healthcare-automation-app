export declare const getAppointments: () => Promise<({
    doctor: {
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
    };
    patient: {
        id: number;
        userId: number | null;
        medicalId: string;
        firstName: string;
        lastName: string;
        dateOfBirth: Date;
        gender: import("../generated/prisma/enums").Gender;
        email: string | null;
        phone: string;
        address: string | null;
        bloodGroup: string | null;
        status: import("../generated/prisma/enums").PatientStatus;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    id: number;
    appointmentNo: string;
    patientId: number;
    doctorId: number;
    appointmentAt: Date;
    duration: number;
    type: import("../generated/prisma/enums").AppointmentType;
    status: import("../generated/prisma/enums").AppointmentStatus;
    reason: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare const getAppointmentById: (id: number) => Promise<({
    doctor: {
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
    };
    patient: {
        id: number;
        userId: number | null;
        medicalId: string;
        firstName: string;
        lastName: string;
        dateOfBirth: Date;
        gender: import("../generated/prisma/enums").Gender;
        email: string | null;
        phone: string;
        address: string | null;
        bloodGroup: string | null;
        status: import("../generated/prisma/enums").PatientStatus;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    id: number;
    appointmentNo: string;
    patientId: number;
    doctorId: number;
    appointmentAt: Date;
    duration: number;
    type: import("../generated/prisma/enums").AppointmentType;
    status: import("../generated/prisma/enums").AppointmentStatus;
    reason: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}) | null>;
export declare const createAppointment: (data: {
    appointmentNo: string;
    patientId: number;
    doctorId: number;
    appointmentAt: Date;
    duration?: number;
    type?: "IN_PERSON" | "VIDEO" | "PHONE";
    reason: string;
    notes?: string;
}) => Promise<{
    id: number;
    appointmentNo: string;
    patientId: number;
    doctorId: number;
    appointmentAt: Date;
    duration: number;
    type: import("../generated/prisma/enums").AppointmentType;
    status: import("../generated/prisma/enums").AppointmentStatus;
    reason: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateAppointment: (id: number, data: {
    appointmentAt?: Date;
    duration?: number;
    type?: "IN_PERSON" | "VIDEO" | "PHONE";
    status?: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
    reason?: string;
    notes?: string;
}) => Promise<{
    id: number;
    appointmentNo: string;
    patientId: number;
    doctorId: number;
    appointmentAt: Date;
    duration: number;
    type: import("../generated/prisma/enums").AppointmentType;
    status: import("../generated/prisma/enums").AppointmentStatus;
    reason: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const cancelAppointment: (id: number) => Promise<{
    id: number;
    appointmentNo: string;
    patientId: number;
    doctorId: number;
    appointmentAt: Date;
    duration: number;
    type: import("../generated/prisma/enums").AppointmentType;
    status: import("../generated/prisma/enums").AppointmentStatus;
    reason: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=appointment.service.d.ts.map