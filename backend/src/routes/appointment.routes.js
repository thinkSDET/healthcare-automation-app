"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const appointment_validator_1 = require("../validators/appointment.validator");
const appointment_controller_1 = require("../controllers/appointment.controller");
const router = (0, express_1.Router)();
// View appointments
// ADMIN and DOCTOR can view appointments.
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), appointment_controller_1.getAppointments);
// Create appointment
// ONLY ADMIN can create appointments.
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), (0, validate_1.validate)(appointment_validator_1.createAppointmentSchema), appointment_controller_1.createAppointment);
// Update appointment status (lifecycle)
// ADMIN and DOCTOR — transition rules enforced in service.
router.patch("/:id/status", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), (0, validate_1.validate)(appointment_validator_1.updateAppointmentStatusSchema), appointment_controller_1.updateAppointmentStatus);
// View appointment details
// ADMIN and DOCTOR can view appointment details.
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), appointment_controller_1.getAppointmentById);
// Update appointment schedule/details
// ONLY ADMIN can update appointments (no status via PUT).
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), (0, validate_1.validate)(appointment_validator_1.updateAppointmentSchema), appointment_controller_1.updateAppointment);
// Cancel appointment
// ONLY ADMIN can cancel appointments (SCHEDULED → CANCELLED).
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), appointment_controller_1.cancelAppointment);
exports.default = router;
//# sourceMappingURL=appointment.routes.js.map