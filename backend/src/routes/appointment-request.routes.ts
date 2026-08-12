/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { Router } from "express";
import {
  createAppointmentRequest,
  listAppointmentRequests,
  getAppointmentRequestById,
  updateAppointmentRequestStatus,
} from "../controllers/appointment-request.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createAppointmentRequestSchema,
  updateAppointmentRequestStatusSchema,
} from "../validators/appointment-request.validator";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("PATIENT"),
  validate(createAppointmentRequestSchema),
  createAppointmentRequest
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PATIENT"),
  listAppointmentRequests
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PATIENT"),
  getAppointmentRequestById
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PATIENT"),
  validate(updateAppointmentRequestStatusSchema),
  updateAppointmentRequestStatus
);

export default router;
