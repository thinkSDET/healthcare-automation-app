/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";

import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/user.controller";

import { validate } from "../middleware/validate";

import {
  createUserSchema,
  updateUserSchema
} from "../validators/user.validator";

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), getUsers);

router.get("/:id", authenticate, authorize("ADMIN"), getUserById);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createUserSchema),
  createUser
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateUserSchema),
  updateUser
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteUser
);

export default router;