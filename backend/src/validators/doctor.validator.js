"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDoctorSchema = exports.createDoctorSchema = void 0;
const zod_1 = require("zod");
exports.createDoctorSchema = zod_1.z.object({
    doctorCode: zod_1.z.string().min(3).max(20),
    firstName: zod_1.z.string().min(2).max(50),
    lastName: zod_1.z.string().min(2).max(50),
    specialization: zod_1.z.string().min(2).max(100),
    licenseNumber: zod_1.z.string().min(3).max(50),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(10).max(15),
    experience: zod_1.z.number().int().min(0).max(60)
});
exports.updateDoctorSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).max(50).optional(),
    lastName: zod_1.z.string().min(2).max(50).optional(),
    specialization: zod_1.z.string().min(2).max(100).optional(),
    phone: zod_1.z.string().min(10).max(15).optional(),
    experience: zod_1.z.number().int().min(0).max(60).optional(),
    status: zod_1.z.enum([
        "ACTIVE",
        "INACTIVE",
        "ON_LEAVE"
    ]).optional()
});
//# sourceMappingURL=doctor.validator.js.map