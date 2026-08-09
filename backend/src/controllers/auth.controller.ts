import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(
      req.body.email,
      req.body.password
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CREDENTIALS"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (
      error instanceof Error &&
      error.message === "USER_NOT_ACTIVE"
    ) {
      return res.status(403).json({
        success: false,
        message: "User account is not active"
      });
    }

    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};