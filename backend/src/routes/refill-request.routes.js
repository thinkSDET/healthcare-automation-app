"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const express_1 = require("express");
const refill_request_controller_1 = require("../controllers/refill-request.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const refill_request_validator_1 = require("../validators/refill-request.validator");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PHARMACIST", "PATIENT"), refill_request_controller_1.listRefillRequests);
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PHARMACIST", "PATIENT"), refill_request_controller_1.getRefillRequestById);
router.patch("/:id/status", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "DOCTOR", "PHARMACIST", "PATIENT"), (0, validate_1.validate)(refill_request_validator_1.updateRefillRequestStatusSchema), refill_request_controller_1.updateRefillRequestStatus);
router.post("/:id/create-order", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PATIENT"), (0, validate_1.validate)(refill_request_validator_1.createOrderFromRefillSchema), refill_request_controller_1.createOrderFromRefillRequest);
exports.default = router;
//# sourceMappingURL=refill-request.routes.js.map