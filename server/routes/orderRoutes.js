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
import { strictLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

/* ======================================================
   USER ROUTES
   ====================================================== */

/* Create order (rate-limited) */
router.post("/", strictLimiter, userAuth, createOrder);

/* Get my orders */
router.get("/my", userAuth, getUserOrders);

/* Cancel order (rate-limited, only Pending) */
router.put("/:id/cancel", strictLimiter, userAuth, cancelOrder);

/*  must come AFTER /my and /:id/cancel */
router.get("/:id", userAuth, getOrderById);

/* ======================================================
   ADMIN ROUTES
   ====================================================== */

/* Get all orders */
router.get("/", adminAuth, getAllOrders);

/* Update order status (rate-limited) */
router.put("/:id", strictLimiter, adminAuth, updateOrderStatus);

export default router;
