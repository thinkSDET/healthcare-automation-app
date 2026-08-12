/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { z } from "zod";

export const createDoctorSchema = z.object({
  doctorCode: z.string().min(3).max(20),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  specialization: z.string().min(2).max(100),
  licenseNumber: z.string().min(3).max(50),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  experience: z.number().int().min(0).max(60)
});

export const updateDoctorSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  specialization: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  experience: z.number().int().min(0).max(60).optional(),
  status: z.enum([
    "ACTIVE",
    "INACTIVE",
    "ON_LEAVE"
  ]).optional()
});