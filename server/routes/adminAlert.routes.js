import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  getAdminAlerts,
  getUnreadAlertCount,
  markAlertAsRead,
} from "../controllers/adminAlert.controller.js";

const router = express.Router();
console.log("🔥 Admin Alert Routes Loaded");

/* ================= ADMIN ALERTS ================= */
router.get("/", adminAuth, getAdminAlerts);

router.get("/unread-count", adminAuth, getUnreadAlertCount);

router.put("/:id/read", adminAuth, markAlertAsRead);

export default router;
