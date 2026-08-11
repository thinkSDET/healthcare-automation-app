interface LoginInput {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export declare const register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    dateOfBirth?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    phone?: string;
    address?: string;
}) => Promise<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: import("../generated/prisma/enums").UserRole;
}>;
export declare const loginUser: ({ email, password, rememberMe, }: LoginInput) => Promise<{
    token: string;
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: import("../generated/prisma/enums").UserRole;
        patientId: number | null;
    };
    expiresIn: string;
}>;
export declare const forgotPassword: (email: string) => Promise<{
    message: string;
    resetToken?: never;
} | {
    message: string;
    resetToken: string;
}>;
export declare const resetPassword: (token: string, newPassword: string) => Promise<{
    message: string;
}>;
export declare const changePassword: (userId: number, currentPassword: string, newPassword: string) => Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=auth.service.d.ts.map