import {
  Router,
} from "express";

import {
  getPatientPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescriptionStatus,
  deletePrescription,
} from "../controllers/prescription.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth";

const router =
  Router();

/*
|--------------------------------------------------------------------------
| Patient Prescription History
|--------------------------------------------------------------------------
*/

router.get(
  "/patient/:patientId",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PHARMACIST"),
  getPatientPrescriptions
);


/*
|--------------------------------------------------------------------------
| Get Prescription
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PHARMACIST"),
  getPrescriptionById
);


/*
|--------------------------------------------------------------------------
| Create Prescription
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  createPrescription
);


/*
|--------------------------------------------------------------------------
| Update Prescription Status
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "DOCTOR", "PHARMACIST"),
  updatePrescriptionStatus
);


/*
|--------------------------------------------------------------------------
| Delete Prescription
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "DOCTOR"),
  deletePrescription
);

export default router;