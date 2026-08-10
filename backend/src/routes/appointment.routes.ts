import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../middleware/auth";

import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
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

// View appointment details
// ADMIN and DOCTOR can view appointment details.
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  getAppointmentById
);

// Create appointment
// ONLY ADMIN can create appointments.
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createAppointment
);

// Update appointment
// ONLY ADMIN can update appointments.
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  updateAppointment
);

// Cancel appointment
// ONLY ADMIN can cancel appointments.
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  cancelAppointment
);

export default router;