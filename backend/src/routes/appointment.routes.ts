import { Router } from "express";
import { authenticate } from "../middleware/auth";

import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment
} from "../controllers/appointment.controller";

const router = Router();

router.get("/", authenticate, getAppointments);

router.get("/:id", authenticate, getAppointmentById);

router.post("/", authenticate, createAppointment);

router.put("/:id", authenticate, updateAppointment);

router.delete("/:id", authenticate, cancelAppointment);

export default router;