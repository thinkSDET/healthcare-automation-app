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
  authorize("ADMIN", "DOCTOR"),
  getPatients
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
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
  authorize("ADMIN", "DOCTOR"),
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
  authorize("ADMIN", "DOCTOR"),
  getPatientDependents
);

router.post(
  "/:id/dependents",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  createPatientDependent
);

router.delete(
  "/:id/dependents/:dependentId",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
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
  authorize("ADMIN", "DOCTOR"),
  getPatientEmergencyContact
);

router.put(
  "/:id/emergency-contact",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  savePatientEmergencyContact
);

router.delete(
  "/:id/emergency-contact",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
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
  authorize("ADMIN", "DOCTOR"),
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
  authorize("ADMIN", "DOCTOR"),
  downloadPatientDocument
);

router.delete(
  "/:id/documents/:documentId",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  deletePatientDocument
);



// /*
// |--------------------------------------------------------------------------
// | Emergency Contact
// |--------------------------------------------------------------------------
// */

// router.get(
//   "/:id/emergency-contact",
//   authenticate,
//   authorize("ADMIN", "DOCTOR"),
//   getPatientEmergencyContact
// );

// router.put(
//   "/:id/emergency-contact",
//   authenticate,
//   authorize("ADMIN", "DOCTOR"),
//   savePatientEmergencyContact
// );

// router.delete(
//   "/:id/emergency-contact",
//   authenticate,
//   authorize("ADMIN", "DOCTOR"),
//   deletePatientEmergencyContact
// );


/*
|--------------------------------------------------------------------------
| Medical Profile
|--------------------------------------------------------------------------
*/

router.get(
  "/:id/medical-profile",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  getPatientMedicalProfile
);

router.put(
  "/:id/medical-profile",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  savePatientMedicalProfile
);

/*
|--------------------------------------------------------------------------
| Appointment History
|--------------------------------------------------------------------------
*/

router.get(
  "/:id/appointments",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  getPatientAppointments
);

export default router;