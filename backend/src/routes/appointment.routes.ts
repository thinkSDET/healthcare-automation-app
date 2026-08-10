import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";

import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment
} from "../controllers/appointment.controller";

const router = Router();

router.get("/", authenticate, authorize("ADMIN", "DOCTOR"), getAppointments);

router.get("/:id", authenticate, authorize("ADMIN", "DOCTOR"), getAppointmentById);

router.post("/", authenticate, authorize("ADMIN", "DOCTOR"), createAppointment);

router.put("/:id", authenticate, authorize("ADMIN", "DOCTOR"), updateAppointment);

router.delete("/:id", authenticate, authorize("ADMIN", "DOCTOR"), cancelAppointment);

export default router;