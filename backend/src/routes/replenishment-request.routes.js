"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const express_1 = require("express");
const replenishment_request_controller_1 = require("../controllers/replenishment-request.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const replenishment_request_validator_1 = require("../validators/replenishment-request.validator");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST"), replenishment_request_controller_1.listReplenishmentRequests);
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST"), (0, validate_1.validate)(replenishment_request_validator_1.createReplenishmentRequestSchema), replenishment_request_controller_1.createReplenishmentRequest);
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST"), replenishment_request_controller_1.getReplenishmentRequestById);
router.patch("/:id/status", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "PHARMACIST"), (0, validate_1.validate)(replenishment_request_validator_1.updateReplenishmentRequestStatusSchema), replenishment_request_controller_1.updateReplenishmentRequestStatus);
exports.default = router;
//# sourceMappingURL=replenishment-request.routes.js.map