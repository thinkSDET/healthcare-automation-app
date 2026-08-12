/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { Router } from "express";
import {
  listReplenishmentRequests,
  getReplenishmentRequestById,
  createReplenishmentRequest,
  updateReplenishmentRequestStatus,
} from "../controllers/replenishment-request.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createReplenishmentRequestSchema,
  updateReplenishmentRequestStatusSchema,
} from "../validators/replenishment-request.validator";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  listReplenishmentRequests
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  validate(createReplenishmentRequestSchema),
  createReplenishmentRequest
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  getReplenishmentRequestById
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  validate(updateReplenishmentRequestStatusSchema),
  updateReplenishmentRequestStatus
);

export default router;
