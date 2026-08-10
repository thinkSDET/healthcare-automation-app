import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "./auth";

export const requirePatientAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const patientId = Number(req.params.id);

  if (Number.isNaN(patientId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid patient ID",
    });
  }

  // ADMIN and DOCTOR can access any patient
  if (
    req.user.role === "ADMIN" ||
    req.user.role === "DOCTOR"
  ) {
    return next();
  }

  // Only PATIENT can continue below
  if (req.user.role !== "PATIENT") {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to access patient records",
    });
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: {
        id: patientId,
      },
      select: {
        userId: true,
      },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // IMPORTANT:
    // Logged-in user must own this patient record
    if (patient.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this patient record",
      });
    }

    next();
  } catch (error) {
    console.error("PATIENT ACCESS CHECK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to verify patient access",
    });
  }
};