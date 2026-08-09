import { z } from "zod";

export const createAppointmentSchema = z.object({
  appointmentNo: z.string().min(3).max(30),
  patientId: z.number().int().positive(),
  doctorId: z.number().int().positive(),
  appointmentAt: z.string().datetime(),
  duration: z.number().int().min(15).max(180).optional(),
  type: z.enum(["IN_PERSON", "VIDEO", "PHONE"]).optional(),
  reason: z.string().min(3).max(250),
  notes: z.string().max(500).optional()
});

export const updateAppointmentSchema = z.object({
  appointmentAt: z.string().datetime().optional(),
  duration: z.number().int().min(15).max(180).optional(),
  type: z.enum(["IN_PERSON", "VIDEO", "PHONE"]).optional(),
  status: z.enum([
    "SCHEDULED",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW"
  ]).optional(),
  reason: z.string().min(3).max(250).optional(),
  notes: z.string().max(500).optional()
});