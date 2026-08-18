"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/*
|--------------------------------------------------------------------------
| Patient Order History
|--------------------------------------------------------------------------
*/
router.get("/patient/:patientId", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST", "PATIENT"), order_controller_1.getPatientOrders);
/*
|--------------------------------------------------------------------------
| Get Order
|--------------------------------------------------------------------------
*/
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST", "PATIENT"), order_controller_1.getOrderById);
/*
|--------------------------------------------------------------------------
| Create Order
|--------------------------------------------------------------------------
*/
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PATIENT"), order_controller_1.createOrder);
/*
|--------------------------------------------------------------------------
| Update Order Status
|--------------------------------------------------------------------------
*/
router.patch("/:id/status", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST"), order_controller_1.updateOrderStatus);
/*
|--------------------------------------------------------------------------
| Update Payment Status
|--------------------------------------------------------------------------
*/
router.patch("/:id/payment-status", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST", "PATIENT"), order_controller_1.updatePaymentStatus);
/*
|--------------------------------------------------------------------------
| Delete Order
|--------------------------------------------------------------------------
*/
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), order_controller_1.deleteOrder);
exports.default = router;
//# sourceMappingURL=order.routes.js.map