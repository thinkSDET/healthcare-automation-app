"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const appointment_controller_1 = require("../controllers/appointment.controller");
const router = (0, express_1.Router)();
// View appointments
// ADMIN and DOCTOR can view appointments.
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), appointment_controller_1.getAppointments);
// View appointment details
// ADMIN and DOCTOR can view appointment details.
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), appointment_controller_1.getAppointmentById);
// Create appointment
// ONLY ADMIN can create appointments.
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), appointment_controller_1.createAppointment);
// Update appointment
// ONLY ADMIN can update appointments.
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), appointment_controller_1.updateAppointment);
// Cancel appointment
// ONLY ADMIN can cancel appointments.
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), appointment_controller_1.cancelAppointment);
exports.default = router;
//# sourceMappingURL=appointment.routes.js.map