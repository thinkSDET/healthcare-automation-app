import { Router } from "express";

import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from "../controllers/patient.controller";

import { authenticate, authorize } from "../middleware/auth";

import { validate } from "../middleware/validate";

import {
  createPatientSchema,
  updatePatientSchema
} from "../validators/patient.validator";

const router = Router();

router.get(
  "/",
  authenticate,
  getPatients
);

router.get(
  "/:id",
  authenticate,
  getPatientById
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  validate(createPatientSchema),
  createPatient
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  validate(updatePatientSchema),
  updatePatient
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deletePatient
);

export default router;