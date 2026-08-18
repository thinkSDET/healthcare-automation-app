"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const express_1 = require("express");
const appointment_request_controller_1 = require("../controllers/appointment-request.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const appointment_request_validator_1 = require("../validators/appointment-request.validator");
const router = (0, express_1.Router)();
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("PATIENT"), (0, validate_1.validate)(appointment_request_validator_1.createAppointmentRequestSchema), appointment_request_controller_1.createAppointmentRequest);
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PATIENT"), appointment_request_controller_1.listAppointmentRequests);
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PATIENT"), appointment_request_controller_1.getAppointmentRequestById);
router.patch("/:id/status", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PATIENT"), (0, validate_1.validate)(appointment_request_validator_1.updateAppointmentRequestStatusSchema), appointment_request_controller_1.updateAppointmentRequestStatus);
exports.default = router;
//# sourceMappingURL=appointment-request.routes.js.map