"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const express_1 = require("express");
const lab_order_controller_1 = require("../controllers/lab-order.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const upload_1 = require("../middleware/upload");
const lab_order_validator_1 = require("../validators/lab-order.validator");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PATIENT"), lab_order_controller_1.listLabTestOrders);
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), (0, validate_1.validate)(lab_order_validator_1.createLabTestOrderSchema), lab_order_controller_1.createLabTestOrder);
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PATIENT"), lab_order_controller_1.getLabTestOrderById);
router.patch("/:id/status", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), (0, validate_1.validate)(lab_order_validator_1.updateLabTestOrderStatusSchema), lab_order_controller_1.updateLabTestOrderStatus);
router.post("/:id/result", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), upload_1.patientDocumentUpload.single("document"), lab_order_controller_1.uploadLabTestResult);
router.post("/:id/acknowledge", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR"), lab_order_controller_1.acknowledgeLabTestOrder);
router.get("/:id/result-document/download", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PATIENT"), lab_order_controller_1.downloadLabTestResult);
exports.default = router;
//# sourceMappingURL=lab-order.routes.js.map