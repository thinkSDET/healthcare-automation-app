/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import {
  Router,
} from "express";

import {
  getPatientPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescriptionStatus,
  deletePrescription,
} from "../controllers/prescription.controller";

import {
  createRefillRequest,
} from "../controllers/refill-request.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth";

import { validate } from "../middleware/validate";

import {
  createRefillRequestSchema,
} from "../validators/refill-request.validator";

const router =
  Router();

/*
|--------------------------------------------------------------------------
| Patient Prescription History
|--------------------------------------------------------------------------
*/

router.get(
  "/patient/:patientId",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PHARMACIST", "PATIENT"),
  getPatientPrescriptions
);

/*
|--------------------------------------------------------------------------
| Refill / Renewal Requests (nested create)
|--------------------------------------------------------------------------
*/

router.post(
  "/:id/refill-requests",
  authenticate,
  authorize("ADMIN", "PHARMACIST", "PATIENT"),
  validate(createRefillRequestSchema),
  createRefillRequest
);

/*
|--------------------------------------------------------------------------
| Get Prescription
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PHARMACIST", "PATIENT"),
  getPrescriptionById
);


/*
|--------------------------------------------------------------------------
| Create Prescription
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  createPrescription
);


/*
|--------------------------------------------------------------------------
| Update Prescription Status
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PHARMACIST"),
  updatePrescriptionStatus
);


/*
|--------------------------------------------------------------------------
| Delete Prescription
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  deletePrescription
);

export default router;
