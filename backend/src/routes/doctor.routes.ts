/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { Router } from "express";

import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorRegistrationRequests,
  getPendingDoctorRegistrationRequestCount,
  approveDoctorRegistrationRequest,
  rejectDoctorRegistrationRequest
} from "../controllers/doctor.controller";

import { authenticate, authorize } from "../middleware/auth";

import { validate } from "../middleware/validate";

import {
  createDoctorSchema,
  updateDoctorSchema
} from "../validators/doctor.validator";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PATIENT"),
  getDoctors
);

/*
 * Doctor self-registration requests
 *
 * These routes are intentionally separate from the existing
 * Doctor CRUD APIs. The existing POST / remains the Admin
 * "Add Doctor" flow.
 */
router.get(
  "/registration-requests",
  authenticate,
  authorize("ADMIN"),
  getDoctorRegistrationRequests
);

router.get(
  "/registration-requests/pending-count",
  authenticate,
  authorize("ADMIN"),
  getPendingDoctorRegistrationRequestCount
);

router.patch(
  "/registration-requests/:id/approve",
  authenticate,
  authorize("ADMIN"),
  approveDoctorRegistrationRequest
);

router.patch(
  "/registration-requests/:id/reject",
  authenticate,
  authorize("ADMIN"),
  rejectDoctorRegistrationRequest
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PATIENT"),
  getDoctorById
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createDoctorSchema),
  createDoctor
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateDoctorSchema),
  updateDoctor
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteDoctor
);

export default router;