import { Router } from "express";

import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} from "../controllers/doctor.controller";

import { authenticate, authorize } from "../middleware/auth";

import { validate } from "../middleware/validate";

import {
  createDoctorSchema,
  updateDoctorSchema
} from "../validators/doctor.validator";

const router = Router();

router.get(
  "/",
  authenticate,
  getDoctors
);

router.get(
  "/:id",
  authenticate,
  getDoctorById
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createDoctorSchema),
  createDoctor
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateDoctorSchema),
  updateDoctor
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteDoctor
);

export default router;