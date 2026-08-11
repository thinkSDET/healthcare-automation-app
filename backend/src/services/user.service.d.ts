export declare const getUsers: () => Promise<{
    createdAt: Date;
    email: string;
    firstName: string;
    id: number;
    lastName: string;
    role: import("../generated/prisma/enums").UserRole;
    status: import("../generated/prisma/enums").UserStatus;
    updatedAt: Date;
}[]>;
export declare const getUserById: (id: number) => Promise<{
    createdAt: Date;
    email: string;
    firstName: string;
    id: number;
    lastName: string;
    role: import("../generated/prisma/enums").UserRole;
    status: import("../generated/prisma/enums").UserStatus;
    updatedAt: Date;
} | null>;
export declare const createUser: (data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    role?: "ADMIN" | "DOCTOR" | "PHARMACIST" | "SUPPORT" | "VIEWER";
}) => Promise<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    role: import("../generated/prisma/enums").UserRole;
    status: import("../generated/prisma/enums").UserStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateUser: (id: number, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: "ADMIN" | "DOCTOR" | "PHARMACIST" | "SUPPORT" | "VIEWER";
    status?: "ACTIVE" | "INACTIVE" | "LOCKED";
}) => Promise<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    role: import("../generated/prisma/enums").UserRole;
    status: import("../generated/prisma/enums").UserStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const deleteUser: (id: number) => Promise<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    role: import("../generated/prisma/enums").UserRole;
    status: import("../generated/prisma/enums").UserStatus;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=user.service.d.ts.map