import { Router } from "express";
import {
  listLabTestOrders,
  getLabTestOrderById,
  createLabTestOrder,
  updateLabTestOrderStatus,
  uploadLabTestResult,
  acknowledgeLabTestOrder,
  downloadLabTestResult,
} from "../controllers/lab-order.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { patientDocumentUpload } from "../middleware/upload";
import {
  createLabTestOrderSchema,
  updateLabTestOrderStatusSchema,
} from "../validators/lab-order.validator";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PATIENT"),
  listLabTestOrders
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  validate(createLabTestOrderSchema),
  createLabTestOrder
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PATIENT"),
  getLabTestOrderById
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  validate(updateLabTestOrderStatusSchema),
  updateLabTestOrderStatus
);

router.post(
  "/:id/result",
  authenticate,
  authorize("ADMIN"),
  patientDocumentUpload.single("document"),
  uploadLabTestResult
);

router.post(
  "/:id/acknowledge",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  acknowledgeLabTestOrder
);

router.get(
  "/:id/result-document/download",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PATIENT"),
  downloadLabTestResult
);

export default router;
