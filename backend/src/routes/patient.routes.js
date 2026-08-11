"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const patient_controller_1 = require("../controllers/patient.controller");
const auth_1 = require("../middleware/auth");
const patient_access_1 = require("../middleware/patient-access");
const validate_1 = require("../middleware/validate");
const upload_1 = require("../middleware/upload");
const patient_document_controller_1 = require("../controllers/patient-document.controller");
const patient_validator_1 = require("../validators/patient.validator");
const router = (0, express_1.Router)();
/*
|--------------------------------------------------------------------------
| Patients
|--------------------------------------------------------------------------
*/
// Patient list
// Only ADMIN and DOCTOR can view all patients.
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), patient_controller_1.getPatients);
// Patient details
// ADMIN/DOCTOR -> any patient
// PATIENT       -> only their own patient record
router.get("/:id", auth_1.authenticate, patient_access_1.requirePatientAccess, patient_controller_1.getPatientById);
// Create patient
// Only ADMIN and DOCTOR can create a patient.
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), (0, validate_1.validate)(patient_validator_1.createPatientSchema), patient_controller_1.createPatient);
// Update patient
// ADMIN/DOCTOR -> any patient
// PATIENT       -> only their own patient record
router.put("/:id", auth_1.authenticate, patient_access_1.requirePatientAccess, (0, validate_1.validate)(patient_validator_1.updatePatientSchema), patient_controller_1.updatePatient);
// Delete patient
// Only ADMIN can permanently delete.
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), patient_controller_1.deletePatient);
// Deactivate patient
// Only ADMIN and DOCTOR.
router.patch("/:id/deactivate", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), patient_controller_1.deactivatePatient);
/*
|--------------------------------------------------------------------------
| Dependents
|--------------------------------------------------------------------------
*/
// View dependents
router.get("/:id/dependents", auth_1.authenticate, patient_access_1.requirePatientAccess, patient_controller_1.getPatientDependents);
// Add dependent
router.post("/:id/dependents", auth_1.authenticate, patient_access_1.requirePatientAccess, patient_controller_1.createPatientDependent);
// Delete dependent
router.delete("/:id/dependents/:dependentId", auth_1.authenticate, patient_access_1.requirePatientAccess, patient_controller_1.deletePatientDependent);
/*
|--------------------------------------------------------------------------
| Emergency Contact
|--------------------------------------------------------------------------
*/
// View emergency contact
router.get("/:id/emergency-contact", auth_1.authenticate, patient_access_1.requirePatientAccess, patient_controller_1.getPatientEmergencyContact);
// Add/update emergency contact
router.put("/:id/emergency-contact", auth_1.authenticate, patient_access_1.requirePatientAccess, patient_controller_1.savePatientEmergencyContact);
// Delete emergency contact
router.delete("/:id/emergency-contact", auth_1.authenticate, patient_access_1.requirePatientAccess, patient_controller_1.deletePatientEmergencyContact);
/*
|--------------------------------------------------------------------------
| Documents
|--------------------------------------------------------------------------
*/
// View documents
// ADMIN/DOCTOR -> any patient
// PATIENT       -> only their own documents
router.get("/:id/documents", auth_1.authenticate, patient_access_1.requirePatientAccess, patient_document_controller_1.getPatientDocuments);
// Upload document
// Keep this restricted to ADMIN/DOCTOR.
router.post("/:id/documents", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), upload_1.patientDocumentUpload.single("document"), patient_document_controller_1.uploadPatientDocument);
// Download document
// ADMIN/DOCTOR -> any patient
// PATIENT       -> only their own documents
router.get("/:id/documents/:documentId/download", auth_1.authenticate, patient_access_1.requirePatientAccess, patient_document_controller_1.downloadPatientDocument);
// Delete document
// Keep this restricted to ADMIN/DOCTOR.
router.delete("/:id/documents/:documentId", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), patient_document_controller_1.deletePatientDocument);
/*
|--------------------------------------------------------------------------
| Medical Profile
|--------------------------------------------------------------------------
*/
// View medical profile
router.get("/:id/medical-profile", auth_1.authenticate, patient_access_1.requirePatientAccess, patient_controller_1.getPatientMedicalProfile);
// Create/update medical profile
router.put("/:id/medical-profile", auth_1.authenticate, patient_access_1.requirePatientAccess, patient_controller_1.savePatientMedicalProfile);
/*
|--------------------------------------------------------------------------
| Appointment History
|--------------------------------------------------------------------------
*/
// View patient's appointment history
router.get("/:id/appointments", auth_1.authenticate, patient_access_1.requirePatientAccess, patient_controller_1.getPatientAppointments);
exports.default = router;
//# sourceMappingURL=patient.routes.js.map