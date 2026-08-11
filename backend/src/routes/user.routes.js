"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const user_controller_1 = require("../controllers/user.controller");
const validate_1 = require("../middleware/validate");
const user_validator_1 = require("../validators/user.validator");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), user_controller_1.getUsers);
router.get("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), user_controller_1.getUserById);
router.post("/", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), (0, validate_1.validate)(user_validator_1.createUserSchema), user_controller_1.createUser);
router.put("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), (0, validate_1.validate)(user_validator_1.updateUserSchema), user_controller_1.updateUser);
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)("ADMIN"), user_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map