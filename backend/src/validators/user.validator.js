"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).max(50),
    lastName: zod_1.z.string().min(2).max(50),
    email: zod_1.z.string().email(),
    passwordHash: zod_1.z.string().min(8),
    role: zod_1.z
        .enum(["ADMIN", "DOCTOR", "PHARMACIST", "SUPPORT", "VIEWER"])
        .optional()
});
exports.updateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).max(50).optional(),
    lastName: zod_1.z.string().min(2).max(50).optional(),
    email: zod_1.z.string().email().optional(),
    role: zod_1.z
        .enum(["ADMIN", "DOCTOR", "PHARMACIST", "SUPPORT", "VIEWER"])
        .optional(),
    status: zod_1.z
        .enum(["ACTIVE", "INACTIVE", "LOCKED"])
        .optional()
});
//# sourceMappingURL=user.validator.js.map