"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../config/prisma");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ||
    "admin@healthcare.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ||
    "Admin@12345";
const createAdmin = async () => {
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: {
            email: ADMIN_EMAIL.toLowerCase(),
        },
    });
    const passwordHash = await bcryptjs_1.default.hash(ADMIN_PASSWORD, 10);
    if (existingUser) {
        const admin = await prisma_1.prisma.user.update({
            where: {
                id: existingUser.id,
            },
            data: {
                role: "ADMIN",
                passwordHash,
                status: "ACTIVE",
            },
        });
        console.log(`Admin account updated: ${admin.email}`);
        return;
    }
    const admin = await prisma_1.prisma.user.create({
        data: {
            firstName: "System",
            lastName: "Administrator",
            email: ADMIN_EMAIL.toLowerCase(),
            passwordHash,
            role: "ADMIN",
            status: "ACTIVE",
        },
    });
    console.log(`Admin account created: ${admin.email}`);
};
createAdmin()
    .catch((error) => {
    console.error("Failed to create admin:", error);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
//# sourceMappingURL=create-admin.js.map