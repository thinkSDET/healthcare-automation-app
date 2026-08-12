import { Router } from "express";
import { listAuditEvents } from "../controllers/audit.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "VIEWER", "SUPPORT"),
  listAuditEvents
);

export default router;
