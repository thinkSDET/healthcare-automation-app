import { z } from "zod";

export const createUserSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  passwordHash: z.string().min(8),
  role: z
    .enum(["ADMIN", "DOCTOR", "PHARMACIST", "SUPPORT", "VIEWER"])
    .optional()
});

export const updateUserSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  role: z
    .enum(["ADMIN", "DOCTOR", "PHARMACIST", "SUPPORT", "VIEWER"])
    .optional(),
  status: z
    .enum(["ACTIVE", "INACTIVE", "LOCKED"])
    .optional()
});