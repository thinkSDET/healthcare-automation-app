/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { Router } from "express";
import {
  listRefillRequests,
  getRefillRequestById,
  updateRefillRequestStatus,
  createOrderFromRefillRequest,
} from "../controllers/refill-request.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  updateRefillRequestStatusSchema,
  createOrderFromRefillSchema,
} from "../validators/refill-request.validator";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PHARMACIST", "PATIENT"),
  listRefillRequests
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PHARMACIST", "PATIENT"),
  getRefillRequestById
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PHARMACIST", "PATIENT"),
  validate(updateRefillRequestStatusSchema),
  updateRefillRequestStatus
);

router.post(
  "/:id/create-order",
  authenticate,
  authorize("ADMIN", "PATIENT"),
  validate(createOrderFromRefillSchema),
  createOrderFromRefillRequest
);

export default router;
