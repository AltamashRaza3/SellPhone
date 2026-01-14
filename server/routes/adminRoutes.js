import express from "express";
import {
  adminLogin,
  adminLogout,
  adminMe,
} from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* ================= AUTH ================= */
router.post("/login", adminLogin);
router.post("/logout", adminLogout);

/* ================= SESSION CHECK ================= */
router.get("/me", adminAuth, adminMe);

export default router;
