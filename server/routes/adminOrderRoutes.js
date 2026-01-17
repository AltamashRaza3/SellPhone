import express from "express";
import {
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
} from "../controllers/adminOrderController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* ================= ADMIN ORDERS ================= */
router.get("/", adminAuth, getAllOrders);
router.get("/:id", adminAuth, getOrderByIdAdmin);
router.put("/:id", adminAuth, updateOrderStatus);

export default router;
