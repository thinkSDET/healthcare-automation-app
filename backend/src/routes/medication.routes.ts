import { Router } from "express";
import {
  listMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  adjustMedicationStock,
  listMedicationMovements,
} from "../controllers/medication.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createMedicationSchema,
  updateMedicationSchema,
  adjustMedicationStockSchema,
} from "../validators/medication.validator";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  listMedications
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  validate(createMedicationSchema),
  createMedication
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  getMedicationById
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  validate(updateMedicationSchema),
  updateMedication
);

router.post(
  "/:id/adjust",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  validate(adjustMedicationStockSchema),
  adjustMedicationStock
);

router.get(
  "/:id/movements",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  listMedicationMovements
);

export default router;
