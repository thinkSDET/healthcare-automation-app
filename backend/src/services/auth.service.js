"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.loginUser = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../config/prisma");
const JWT_SECRET = process.env.JWT_SECRET || "local-development-secret";
const NORMAL_TOKEN_EXPIRY = "1h";
const REMEMBER_ME_EXPIRY = "30d";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;
/* =========================================================
   REGISTER
========================================================= */
/* =========================================================
   REGISTER
========================================================= */
const register = async (data) => {
    const { firstName, lastName, email, password, role, dateOfBirth, gender, phone, address, } = data;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRole = (role || "PATIENT").toUpperCase();
    /*
     * Public registration is allowed only for
     * these roles.
     *
     * ADMIN must never be created through
     * the public registration endpoint.
     */
    const allowedRoles = [
        "PATIENT",
        "DOCTOR",
        "PHARMACIST",
    ];
    if (!allowedRoles.includes(normalizedRole)) {
        throw new Error("INVALID_PUBLIC_ROLE");
    }
    /*
     * Patient accounts require the minimum
     * information needed to create the Patient
     * domain record.
     */
    if (normalizedRole === "PATIENT") {
        if (!dateOfBirth || !gender || !phone) {
            throw new Error("PATIENT_PROFILE_REQUIRED");
        }
        const parsedDateOfBirth = new Date(dateOfBirth);
        if (Number.isNaN(parsedDateOfBirth.getTime())) {
            throw new Error("INVALID_DATE_OF_BIRTH");
        }
    }
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });
    if (existingUser) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    /*
     * User + Patient must be created together.
     */
    const user = await prisma_1.prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
            data: {
                firstName,
                lastName,
                email: normalizedEmail,
                passwordHash,
                role: normalizedRole,
            },
        });
        /*
         * Only PATIENT accounts receive a
         * Patient domain record automatically.
         */
        if (normalizedRole === "PATIENT") {
            /*
             * The User ID gives us a guaranteed
             * unique Medical ID for this account.
             *
             * Example:
             * User ID 25 -> PAT-00025
             */
            const medicalId = `PAT-${String(createdUser.id).padStart(5, "0")}`;
            await tx.patient.create({
                data: {
                    userId: createdUser.id,
                    medicalId,
                    firstName: createdUser.firstName,
                    lastName: createdUser.lastName,
                    dateOfBirth: new Date(dateOfBirth),
                    gender: gender,
                    email: createdUser.email,
                    phone: phone,
                    address: address || undefined,
                },
            });
        }
        return createdUser;
    });
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
    };
};
exports.register = register;
/* =========================================================
   LOGIN
========================================================= */
const loginUser = async ({ email, password, rememberMe = false, }) => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma_1.prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    /* =======================================================
       ACCOUNT SECURITY
    ======================================================= */
    let security = await prisma_1.prisma.accountSecurity.findUnique({
        where: {
            userId: user.id,
        },
    });
    if (!security) {
        security =
            await prisma_1.prisma.accountSecurity.create({
                data: {
                    userId: user.id,
                },
            });
    }
    /* =======================================================
       ACCOUNT LOCK CHECK
    ======================================================= */
    if (security.lockedUntil &&
        security.lockedUntil.getTime() >
            Date.now()) {
        const remainingMinutes = Math.ceil((security.lockedUntil.getTime() -
            Date.now()) /
            60000);
        throw new Error(`Account is temporarily locked. Try again in ${remainingMinutes} minute(s).`);
    }
    /* =======================================================
       USER STATUS CHECK
    ======================================================= */
    if (user.status === "INACTIVE") {
        throw new Error("Your account is inactive. Please contact support.");
    }
    if (user.status === "LOCKED") {
        throw new Error("Your account is locked. Please contact support.");
    }
    /* =======================================================
       PASSWORD VALIDATION
    ======================================================= */
    // IMPORTANT:
    // Prisma User model uses passwordHash
    // NOT password
    const passwordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!passwordValid) {
        const attempts = security.failedLoginAttempts + 1;
        /* =====================================================
           LOCK ACCOUNT AFTER MAX ATTEMPTS
        ===================================================== */
        if (attempts >=
            MAX_LOGIN_ATTEMPTS) {
            const lockedUntil = new Date(Date.now() +
                LOCK_TIME_MINUTES *
                    60 *
                    1000);
            await prisma_1.prisma.accountSecurity.update({
                where: {
                    userId: user.id,
                },
                data: {
                    failedLoginAttempts: 0,
                    lockedUntil,
                },
            });
            throw new Error(`Account locked for ${LOCK_TIME_MINUTES} minutes because of multiple failed login attempts.`);
        }
        /* =====================================================
           INCREMENT FAILED ATTEMPTS
        ===================================================== */
        await prisma_1.prisma.accountSecurity.update({
            where: {
                userId: user.id,
            },
            data: {
                failedLoginAttempts: attempts,
            },
        });
        throw new Error("Invalid email or password");
    }
    /* =======================================================
       SUCCESSFUL LOGIN
    ======================================================= */
    await prisma_1.prisma.accountSecurity.update({
        where: {
            userId: user.id,
        },
        data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
        },
    });
    /* =======================================================
       JWT TOKEN
    ======================================================= */
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        role: user.role,
        email: user.email,
    }, JWT_SECRET, {
        expiresIn: rememberMe
            ? REMEMBER_ME_EXPIRY
            : NORMAL_TOKEN_EXPIRY,
    });
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        },
        expiresIn: rememberMe
            ? REMEMBER_ME_EXPIRY
            : NORMAL_TOKEN_EXPIRY,
    };
};
exports.loginUser = loginUser;
/* =========================================================
   FORGOT PASSWORD
========================================================= */
const forgotPassword = async (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma_1.prisma.user.findUnique({
        where: {
            email: normalizedEmail,
        },
    });
    /*
     * Do not reveal whether the email exists.
     * This prevents account enumeration.
     */
    if (!user) {
        return {
            message: "If an account exists with this email, password reset instructions have been sent.",
        };
    }
    /* =======================================================
       GENERATE RESET TOKEN
    ======================================================= */
    const rawToken = crypto_1.default
        .randomBytes(32)
        .toString("hex");
    const tokenHash = crypto_1.default
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
    const expiresAt = new Date(Date.now() +
        15 * 60 * 1000);
    /* =======================================================
       REMOVE OLD UNUSED TOKENS
    ======================================================= */
    await prisma_1.prisma.passwordResetToken.deleteMany({
        where: {
            userId: user.id,
            used: false,
        },
    });
    /* =======================================================
       CREATE RESET TOKEN
    ======================================================= */
    await prisma_1.prisma.passwordResetToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt,
        },
    });
    /*
     * Development only.
     * Later replace this with email service.
     */
    console.log(`PASSWORD RESET TOKEN for ${user.email}: ${rawToken}`);
    return {
        message: "If an account exists with this email, password reset instructions have been sent.",
        // Development only
        resetToken: rawToken,
    };
};
exports.forgotPassword = forgotPassword;
/* =========================================================
   RESET PASSWORD
========================================================= */
const resetPassword = async (token, newPassword) => {
    const tokenHash = crypto_1.default
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const resetToken = await prisma_1.prisma.passwordResetToken.findUnique({
        where: {
            tokenHash,
        },
    });
    if (!resetToken) {
        throw new Error("Invalid or expired reset token");
    }
    if (resetToken.used) {
        throw new Error("Reset token has already been used");
    }
    if (resetToken.expiresAt.getTime() <
        Date.now()) {
        throw new Error("Invalid or expired reset token");
    }
    /* =======================================================
       HASH NEW PASSWORD
    ======================================================= */
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    /* =======================================================
       UPDATE PASSWORD
    ======================================================= */
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.update({
            where: {
                id: resetToken.userId,
            },
            data: {
                // IMPORTANT:
                // Prisma field is passwordHash
                passwordHash: hashedPassword,
            },
        }),
        prisma_1.prisma.passwordResetToken.update({
            where: {
                id: resetToken.id,
            },
            data: {
                used: true,
            },
        }),
        prisma_1.prisma.accountSecurity.upsert({
            where: {
                userId: resetToken.userId,
            },
            update: {
                failedLoginAttempts: 0,
                lockedUntil: null,
                passwordChangedAt: new Date(),
            },
            create: {
                userId: resetToken.userId,
                failedLoginAttempts: 0,
                lockedUntil: null,
                passwordChangedAt: new Date(),
            },
        }),
    ]);
    return {
        message: "Password reset successfully",
    };
};
exports.resetPassword = resetPassword;
/* =========================================================
   CHANGE PASSWORD
========================================================= */
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    /* =======================================================
       CHECK CURRENT PASSWORD
    ======================================================= */
    // IMPORTANT:
    // Prisma field is passwordHash
    // NOT password
    const valid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
    if (!valid) {
        throw new Error("Current password is incorrect");
    }
    /* =======================================================
       PREVENT SAME PASSWORD
    ======================================================= */
    if (currentPassword ===
        newPassword) {
        throw new Error("New password must be different from current password");
    }
    /* =======================================================
       HASH NEW PASSWORD
    ======================================================= */
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    /* =======================================================
       UPDATE USER PASSWORD
    ======================================================= */
    await prisma_1.prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            // IMPORTANT:
            // Prisma field is passwordHash
            passwordHash: hashedPassword,
        },
    });
    /* =======================================================
       UPDATE SECURITY INFORMATION
    ======================================================= */
    await prisma_1.prisma.accountSecurity.upsert({
        where: {
            userId,
        },
        update: {
            passwordChangedAt: new Date(),
        },
        create: {
            userId,
            passwordChangedAt: new Date(),
        },
    });
    return {
        message: "Password changed successfully",
    };
};
exports.changePassword = changePassword;
//# sourceMappingURL=auth.service.js.map