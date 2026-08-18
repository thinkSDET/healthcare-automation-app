"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const express_1 = require("express");
const medication_controller_1 = require("../controllers/medication.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const medication_validator_1 = require("../validators/medication.validator");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST"), medication_controller_1.listMedications);
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST"), (0, validate_1.validate)(medication_validator_1.createMedicationSchema), medication_controller_1.createMedication);
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST"), medication_controller_1.getMedicationById);
router.patch("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST"), (0, validate_1.validate)(medication_validator_1.updateMedicationSchema), medication_controller_1.updateMedication);
router.post("/:id/adjust", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST"), (0, validate_1.validate)(medication_validator_1.adjustMedicationStockSchema), medication_controller_1.adjustMedicationStock);
router.get("/:id/movements", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST"), medication_controller_1.listMedicationMovements);
exports.default = router;
//# sourceMappingURL=medication.routes.js.map