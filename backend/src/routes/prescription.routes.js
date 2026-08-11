"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prescription_controller_1 = require("../controllers/prescription.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/*
|--------------------------------------------------------------------------
| Patient Prescription History
|--------------------------------------------------------------------------
*/
router.get("/patient/:patientId", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PHARMACIST"), prescription_controller_1.getPatientPrescriptions);
/*
|--------------------------------------------------------------------------
| Get Prescription
|--------------------------------------------------------------------------
*/
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PHARMACIST"), prescription_controller_1.getPrescriptionById);
/*
|--------------------------------------------------------------------------
| Create Prescription
|--------------------------------------------------------------------------
*/
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), prescription_controller_1.createPrescription);
/*
|--------------------------------------------------------------------------
| Update Prescription Status
|--------------------------------------------------------------------------
*/
router.patch("/:id/status", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PHARMACIST"), prescription_controller_1.updatePrescriptionStatus);
/*
|--------------------------------------------------------------------------
| Delete Prescription
|--------------------------------------------------------------------------
*/
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), prescription_controller_1.deletePrescription);
exports.default = router;
//# sourceMappingURL=prescription.routes.js.map