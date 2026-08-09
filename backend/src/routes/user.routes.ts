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

import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, getUsers);

router.get("/:id", authenticate, getUserById);

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