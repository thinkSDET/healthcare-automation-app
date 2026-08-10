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
  deleteOrder
);


export default router;