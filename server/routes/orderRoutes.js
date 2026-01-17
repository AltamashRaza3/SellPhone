import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

/* ======================================================
   USER ROUTES
   ====================================================== */
router.post("/", userAuth, createOrder);
router.get("/my", userAuth, getUserOrders);

/* Cancel order (USER – only if Pending) */
router.put("/:id/cancel", userAuth, cancelOrder);

/* 🔴 IMPORTANT: must come AFTER /my and /:id/cancel */
router.get("/:id", userAuth, getOrderById);

/* ======================================================
   ADMIN ROUTES
   ====================================================== */
router.get("/", adminAuth, getAllOrders);
router.put("/:id", adminAuth, updateOrderStatus);

export default router;
