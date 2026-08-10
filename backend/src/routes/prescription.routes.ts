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
  deletePrescription
);

export default router;