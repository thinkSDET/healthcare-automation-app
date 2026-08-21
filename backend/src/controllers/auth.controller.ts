/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      dateOfBirth,
      gender,
      phone,
      address,
    specialization,
    licenseNumber,
    experience,
    } = req.body;

    const allowedPublicRoles = [
      "PATIENT",
      "DOCTOR",
      "PHARMACIST",
    ];

    const normalizedRole = String(
      role || "PATIENT"
    )
      .trim()
      .toUpperCase();

    if (
      !allowedPublicRoles.includes(
        normalizedRole
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This account type cannot be created through public registration.",
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
      specialization,
      licenseNumber,
      experience,
    });

    return res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "PATIENT_PROFILE_REQUIRED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Date of birth, gender, phone and address are required for patient registration.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      email,
      password,
      rememberMe,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const result =
      await authService.loginUser({
        email,
        password,
        rememberMe: Boolean(
          rememberMe
        ),
      });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Login failed",
    });
  }
};

export const forgotPasswordController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const result =
        await authService.forgotPassword(
          email
        );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to process request",
      });
    }
  };

export const resetPasswordController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        token,
        newPassword,
      } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Token and new password are required",
        });
      }

      const result =
        await authService.resetPassword(
          token,
          newPassword
        );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Password reset failed",
      });
    }
  };

export const changePasswordController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      if (
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Current password and new password are required",
        });
      }

      const userId = req.user.userId;

      const result =
        await authService.changePassword(
          userId,
          currentPassword,
          newPassword
        );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Password change failed",
      });
    }
  };