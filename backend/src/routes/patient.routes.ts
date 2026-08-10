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
  deletePatientDependent,
  getPatientEmergencyContact,
  savePatientEmergencyContact,
  deletePatientEmergencyContact,
} from "../controllers/patient.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth";

import {
  validate,
} from "../middleware/validate";

import {
  patientDocumentUpload,
} from "../middleware/upload";

import {
  getPatientDocuments,
  uploadPatientDocument,
  downloadPatientDocument,
  deletePatientDocument,
} from "../controllers/patient-document.controller";

import {
  createPatientSchema,
  updatePatientSchema,
} from "../validators/patient.validator";

const router = Router();

/*
|--------------------------------------------------------------------------
| Patients
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Dependents
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Emergency Contact
|--------------------------------------------------------------------------
*/

router.get(
  "/:id/emergency-contact",
  authenticate,
  getPatientEmergencyContact
);

router.put(
  "/:id/emergency-contact",
  authenticate,
  savePatientEmergencyContact
);

router.delete(
  "/:id/emergency-contact",
  authenticate,
  deletePatientEmergencyContact
);

/*
|--------------------------------------------------------------------------
| Documents
|--------------------------------------------------------------------------
*/

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

export default router;