"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const prisma_1 = require("../config/prisma");
const getUsers = async () => {
    return prisma_1.prisma.user.findMany({
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};
exports.getUsers = getUsers;
const getUserById = async (id) => {
    return prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true
        }
    });
};
exports.getUserById = getUserById;
const createUser = async (data) => {
    return prisma_1.prisma.user.create({
        data
    });
};
exports.createUser = createUser;
const updateUser = async (id, data) => {
    return prisma_1.prisma.user.update({
        where: { id },
        data
    });
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    return prisma_1.prisma.user.delete({
        where: { id }
    });
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.service.js.map