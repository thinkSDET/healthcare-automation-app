import { Router } from "express";

import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  deactivatePatient,
  getPatientDependents,
  createPatientDependent,
  deletePatientDependent
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
router.patch(
  "/:id/deactivate",
  authenticate,
  deactivatePatient
);
router.get(
  "/:id/dependents",
  authenticate,
  getPatientDependents
);

router.post(
  "/:id/dependents",
  authenticate,
  createPatientDependent
);

router.delete(
  "/:id/dependents/:dependentId",
  authenticate,
  deletePatientDependent
);

export default router;