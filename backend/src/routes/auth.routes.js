"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.register);
router.post("/login", auth_controller_1.login);
// New authentication routes
router.post("/forgot-password", auth_controller_1.forgotPasswordController);
router.post("/reset-password", auth_controller_1.resetPasswordController);
router.post("/change-password", auth_1.authenticate, auth_controller_1.changePasswordController);
// Logout
router.post("/logout", auth_1.authenticate, (_req, res) => {
    /*
     * JWT is stateless.
     *
     * The actual token is removed by the frontend.
     * This endpoint exists so the application
     * has a proper logout API contract.
     */
    return res.status(200).json({
        success: true,
        message: "Logout successful",
    });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map