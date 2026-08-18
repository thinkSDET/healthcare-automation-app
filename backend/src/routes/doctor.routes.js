"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const express_1 = require("express");
const doctor_controller_1 = require("../controllers/doctor.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const doctor_validator_1 = require("../validators/doctor.validator");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PATIENT"), doctor_controller_1.getDoctors);
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PATIENT"), doctor_controller_1.getDoctorById);
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), (0, validate_1.validate)(doctor_validator_1.createDoctorSchema), doctor_controller_1.createDoctor);
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), (0, validate_1.validate)(doctor_validator_1.updateDoctorSchema), doctor_controller_1.updateDoctor);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), doctor_controller_1.deleteDoctor);
exports.default = router;
//# sourceMappingURL=doctor.routes.js.map