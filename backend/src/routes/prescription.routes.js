"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const express_1 = require("express");
const prescription_controller_1 = require("../controllers/prescription.controller");
const refill_request_controller_1 = require("../controllers/refill-request.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const refill_request_validator_1 = require("../validators/refill-request.validator");
const router = (0, express_1.Router)();
/*
|--------------------------------------------------------------------------
| Patient Prescription History
|--------------------------------------------------------------------------
*/
router.get("/patient/:patientId", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PHARMACIST", "PATIENT"), prescription_controller_1.getPatientPrescriptions);
/*
|--------------------------------------------------------------------------
| Refill / Renewal Requests (nested create)
|--------------------------------------------------------------------------
*/
router.post("/:id/refill-requests", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST", "PATIENT"), (0, validate_1.validate)(refill_request_validator_1.createRefillRequestSchema), refill_request_controller_1.createRefillRequest);
/*
|--------------------------------------------------------------------------
| Get Prescription
|--------------------------------------------------------------------------
*/
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PHARMACIST", "PATIENT"), prescription_controller_1.getPrescriptionById);
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