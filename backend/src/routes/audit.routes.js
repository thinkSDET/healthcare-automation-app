"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN", "VIEWER", "SUPPORT"), audit_controller_1.listAuditEvents);
exports.default = router;
//# sourceMappingURL=audit.routes.js.map