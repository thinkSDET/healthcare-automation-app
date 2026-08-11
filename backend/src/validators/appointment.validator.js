"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAppointmentSchema = exports.createAppointmentSchema = void 0;
const zod_1 = require("zod");
exports.createAppointmentSchema = zod_1.z.object({
    appointmentNo: zod_1.z.string().min(3).max(30),
    patientId: zod_1.z.number().int().positive(),
    doctorId: zod_1.z.number().int().positive(),
    appointmentAt: zod_1.z.string().datetime(),
    duration: zod_1.z.number().int().min(15).max(180).optional(),
    type: zod_1.z.enum(["IN_PERSON", "VIDEO", "PHONE"]).optional(),
    reason: zod_1.z.string().min(3).max(250),
    notes: zod_1.z.string().max(500).optional()
});
exports.updateAppointmentSchema = zod_1.z.object({
    appointmentAt: zod_1.z.string().datetime().optional(),
    duration: zod_1.z.number().int().min(15).max(180).optional(),
    type: zod_1.z.enum(["IN_PERSON", "VIDEO", "PHONE"]).optional(),
    status: zod_1.z.enum([
        "SCHEDULED",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW"
    ]).optional(),
    reason: zod_1.z.string().min(3).max(250).optional(),
    notes: zod_1.z.string().max(500).optional()
});
//# sourceMappingURL=appointment.validator.js.map