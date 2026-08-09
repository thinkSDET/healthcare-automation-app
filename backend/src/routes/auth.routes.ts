import { Router } from "express";
import {
  register,
  login,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// New authentication routes
router.post(
  "/forgot-password",
  forgotPasswordController
);

router.post(
  "/reset-password",
  resetPasswordController
);

router.post(
  "/change-password",
  authenticate,
  changePasswordController
);


// Logout
router.post(
  "/logout",
  authenticate,
  (_req, res) => {
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
  }
);

export default router;