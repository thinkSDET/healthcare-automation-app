import { z } from "zod";

export const createPatientSchema = z.object({
  medicalId: z.string().min(3).max(30),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15),
  address: z.string().max(250).optional(),
  bloodGroup: z.string().max(5).optional()
});

export const updatePatientSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15).optional(),
  address: z.string().max(250).optional(),
  bloodGroup: z.string().max(5).optional(),
  status: z.enum([
    "ACTIVE",
    "INACTIVE",
    "DECEASED"
  ]).optional()
});