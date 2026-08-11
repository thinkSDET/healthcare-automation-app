import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateAppointmentStatusSchema,
} from "../validators/appointment.validator";
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
} from "../controllers/appointment.controller";

const router = Router();

// View appointments
// ADMIN and DOCTOR can view appointments.
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  getAppointments
);

// Create appointment
// ONLY ADMIN can create appointments.
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createAppointmentSchema),
  createAppointment
);

// Update appointment status (lifecycle)
// ADMIN and DOCTOR — transition rules enforced in service.
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  validate(updateAppointmentStatusSchema),
  updateAppointmentStatus
);

// View appointment details
// ADMIN and DOCTOR can view appointment details.
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  getAppointmentById
);

// Update appointment schedule/details
// ONLY ADMIN can update appointments (no status via PUT).
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateAppointmentSchema),
  updateAppointment
);

// Cancel appointment
// ONLY ADMIN can cancel appointments (SCHEDULED → CANCELLED).
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  cancelAppointment
);

export default router;
