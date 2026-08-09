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
import { patientDocumentUpload } from "../middleware/upload";

import {
  getPatientDocuments,
  uploadPatientDocument,
  downloadPatientDocument,
  deletePatientDocument,
} from "../controllers/patient-document.controller";;

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
router.get("/", authenticate, getPatients);

router.get(
  "/:id/documents",
  authenticate,
  getPatientDocuments
);

router.post(
  "/:id/documents",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  patientDocumentUpload.single("document"),
  uploadPatientDocument
);

router.get(
  "/:id/documents/:documentId/download",
  authenticate,
  downloadPatientDocument
);

router.delete(
  "/:id/documents/:documentId",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  deletePatientDocument
);

router.get(
  "/:id",
  authenticate,
  getPatientById
);

export default router;