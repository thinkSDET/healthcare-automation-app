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
  getPatientMedicalProfile,
  savePatientMedicalProfile,
  getPatientAppointments,
} from "../controllers/patient.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth";

import {
  requirePatientAccess,
} from "../middleware/patient-access";

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

// Patient list
// Only ADMIN and DOCTOR can view all patients.
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  getPatients
);

// Patient details
// ADMIN/DOCTOR -> any patient
// PATIENT       -> only their own patient record
router.get(
  "/:id",
  authenticate,
  requirePatientAccess,
  getPatientById
);

// Create patient
// Only ADMIN and DOCTOR can create a patient.
router.post(
  "/",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  validate(createPatientSchema),
  createPatient
);

// Update patient
// ADMIN/DOCTOR -> any patient
// PATIENT       -> only their own patient record
router.put(
  "/:id",
  authenticate,
  requirePatientAccess,
  validate(updatePatientSchema),
  updatePatient
);

// Delete patient
// Only ADMIN can permanently delete.
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deletePatient
);

// Deactivate patient
// Only ADMIN and DOCTOR.
router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  deactivatePatient
);

/*
|--------------------------------------------------------------------------
| Dependents
|--------------------------------------------------------------------------
*/

// View dependents
router.get(
  "/:id/dependents",
  authenticate,
  requirePatientAccess,
  getPatientDependents
);

// Add dependent
router.post(
  "/:id/dependents",
  authenticate,
  requirePatientAccess,
  createPatientDependent
);

// Delete dependent
router.delete(
  "/:id/dependents/:dependentId",
  authenticate,
  requirePatientAccess,
  deletePatientDependent
);

/*
|--------------------------------------------------------------------------
| Emergency Contact
|--------------------------------------------------------------------------
*/

// View emergency contact
router.get(
  "/:id/emergency-contact",
  authenticate,
  requirePatientAccess,
  getPatientEmergencyContact
);

// Add/update emergency contact
router.put(
  "/:id/emergency-contact",
  authenticate,
  requirePatientAccess,
  savePatientEmergencyContact
);

// Delete emergency contact
router.delete(
  "/:id/emergency-contact",
  authenticate,
  requirePatientAccess,
  deletePatientEmergencyContact
);

/*
|--------------------------------------------------------------------------
| Documents
|--------------------------------------------------------------------------
*/

// View documents
// ADMIN/DOCTOR -> any patient
// PATIENT       -> only their own documents
router.get(
  "/:id/documents",
  authenticate,
  requirePatientAccess,
  getPatientDocuments
);

// Upload document
// Keep this restricted to ADMIN/DOCTOR.
router.post(
  "/:id/documents",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  patientDocumentUpload.single("document"),
  uploadPatientDocument
);

// Download document
// ADMIN/DOCTOR -> any patient
// PATIENT       -> only their own documents
router.get(
  "/:id/documents/:documentId/download",
  authenticate,
  requirePatientAccess,
  downloadPatientDocument
);

// Delete document
// Keep this restricted to ADMIN/DOCTOR.
router.delete(
  "/:id/documents/:documentId",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  deletePatientDocument
);

/*
|--------------------------------------------------------------------------
| Medical Profile
|--------------------------------------------------------------------------
*/

// View medical profile
router.get(
  "/:id/medical-profile",
  authenticate,
  requirePatientAccess,
  getPatientMedicalProfile
);

// Create/update medical profile
router.put(
  "/:id/medical-profile",
  authenticate,
  requirePatientAccess,
  savePatientMedicalProfile
);

/*
|--------------------------------------------------------------------------
| Appointment History
|--------------------------------------------------------------------------
*/

// View patient's appointment history
router.get(
  "/:id/appointments",
  authenticate,
  requirePatientAccess,
  getPatientAppointments
);

export default router;