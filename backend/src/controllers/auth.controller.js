"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordController = exports.resetPasswordController = exports.forgotPasswordController = exports.login = exports.register = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const express_1 = require("express");
const authService = __importStar(require("../services/auth.service"));
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, dateOfBirth, gender, phone, address, } = req.body;
        const allowedPublicRoles = [
            "PATIENT",
            "DOCTOR",
            "PHARMACIST",
        ];
        const normalizedRole = String(role || "PATIENT")
            .trim()
            .toUpperCase();
        if (!allowedPublicRoles.includes(normalizedRole)) {
            return res.status(403).json({
                success: false,
                message: "This account type cannot be created through public registration.",
            });
        }
        const user = await authService.register({
            firstName,
            lastName,
            email,
            password,
            role: normalizedRole,
            dateOfBirth,
            gender,
            phone,
            address,
        });
        return res.status(201).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error("REGISTER ERROR:", error);
        if (error instanceof Error &&
            error.message === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }
        if (error instanceof Error &&
            error.message ===
                "PATIENT_PROFILE_REQUIRED") {
            return res.status(400).json({
                success: false,
                message: "Date of birth, gender, phone and address are required for patient registration.",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Registration failed",
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password, rememberMe, } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        const result = await authService.loginUser({
            email,
            password,
            rememberMe: Boolean(rememberMe),
        });
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    }
    catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(401).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Login failed",
        });
    }
};
exports.login = login;
const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }
        const result = await authService.forgotPassword(email);
        return res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to process request",
        });
    }
};
exports.forgotPasswordController = forgotPasswordController;
const resetPasswordController = async (req, res) => {
    try {
        const { token, newPassword, } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Token and new password are required",
            });
        }
        const result = await authService.resetPassword(token, newPassword);
        return res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        console.error("RESET PASSWORD ERROR:", error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Password reset failed",
        });
    }
};
exports.resetPasswordController = resetPasswordController;
const changePasswordController = async (req, res) => {
    try {
        const { currentPassword, newPassword, } = req.body;
        if (!currentPassword ||
            !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required",
            });
        }
        const userId = req.user.userId;
        const result = await authService.changePassword(userId, currentPassword, newPassword);
        return res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        console.error("CHANGE PASSWORD ERROR:", error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Password change failed",
        });
    }
};
exports.changePasswordController = changePasswordController;
//# sourceMappingURL=auth.controller.js.map