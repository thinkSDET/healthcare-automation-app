"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePatientSchema = exports.createPatientSchema = void 0;
const zod_1 = require("zod");
exports.createPatientSchema = zod_1.z.object({
    medicalId: zod_1.z.string().min(3).max(30),
    firstName: zod_1.z.string().min(2).max(50),
    lastName: zod_1.z.string().min(2).max(50),
    // Accept HTML date inputs (YYYY-MM-DD) and full ISO datetimes
    dateOfBirth: zod_1.z.union([
        zod_1.z.string().date(),
        zod_1.z.string().datetime(),
    ]),
    gender: zod_1.z.enum(["MALE", "FEMALE", "OTHER"]),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(10).max(15),
    address: zod_1.z.string().max(250).optional(),
    bloodGroup: zod_1.z.string().max(5).optional()
});
exports.updatePatientSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).max(50).optional(),
    lastName: zod_1.z.string().min(2).max(50).optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(10).max(15).optional(),
    address: zod_1.z.string().max(250).optional(),
    bloodGroup: zod_1.z.string().max(5).optional(),
    status: zod_1.z.enum([
        "ACTIVE",
        "INACTIVE",
        "DECEASED"
    ]).optional()
});
//# sourceMappingURL=patient.validator.js.map