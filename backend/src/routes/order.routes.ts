import {
  Router,
} from "express";

import {
  getPatientOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} from "../controllers/order.controller";

import {
  authenticate,
  authorize,
} from "../middleware/auth";

const router =
  Router();


/*
|--------------------------------------------------------------------------
| Patient Order History
|--------------------------------------------------------------------------
*/

router.get(
  "/patient/:patientId",
  authenticate,
  authorize("ADMIN", "PHARMACIST", "PATIENT"),
  getPatientOrders
);


/*
|--------------------------------------------------------------------------
| Get Order
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "PHARMACIST", "PATIENT"),
  getOrderById
);


/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "PATIENT"),
  createOrder
);


/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "PHARMACIST"),
  updateOrderStatus
);


/*
|--------------------------------------------------------------------------
| Update Payment Status
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/payment-status",
  authenticate,
  authorize("ADMIN", "PHARMACIST", "PATIENT"),
  updatePaymentStatus
);


/*
|--------------------------------------------------------------------------
| Delete Order
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteOrder
);


export default router;