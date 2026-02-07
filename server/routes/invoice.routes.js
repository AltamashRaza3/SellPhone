import express from "express";
import SellRequest from "../src/models/SellRequest.js";
import Order from "../models/Order.js";

import { generateInvoice } from "../utils/generateSellInvoice.js";
import { generateOrderInvoice } from "../utils/generateOrderInvoice.js";

import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

/* ======================================================
   SELL PHONE INVOICE (USER – STREAM ONLY)
   GET /api/invoices/sell/:id
====================================================== */
router.get("/sell/:id", userAuth, async (req, res) => {
  try {
    const sellRequest = await SellRequest.findOne({
      _id: req.params.id,
      "user.uid": req.user.uid,
    });

    if (!sellRequest) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    if (sellRequest.pickup?.status !== "Completed") {
      return res.status(400).json({
        message: "Invoice available only after pickup completion",
      });
    }

    // 🔥 STREAM PDF (NO FILE SYSTEM)
    const doc = await generateInvoice(sellRequest);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SELL-${sellRequest._id
        .toString()
        .slice(-6)}.pdf`
    );

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error("❌ SELL INVOICE ERROR:", err);
    res.status(500).json({ message: "Failed to download invoice" });
  }
});

/* ======================================================
   ORDER INVOICE (USER – STREAM)
   GET /api/invoices/order/:id
====================================================== */
router.get("/order/:id", userAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.productId"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.uid !== req.user.uid) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({
        message: "Invoice available only after delivery",
      });
    }

    const doc = await generateOrderInvoice(order);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ORD-${order._id.toString().slice(-6)}.pdf`
    );

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error("❌ ORDER INVOICE ERROR:", err);
    res.status(500).json({ message: "Failed to download invoice" });
  }
});

/* ======================================================
   ORDER INVOICE (ADMIN – STREAM TOO, KEEP SIMPLE)
   GET /api/invoices/admin/order/:id
====================================================== */
router.get("/admin/order/:id", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "items.productId"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({
        message: "Invoice available only after delivery",
      });
    }

    const doc = await generateOrderInvoice(order);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ORD-${order._id.toString().slice(-6)}.pdf`
    );

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error("❌ ADMIN ORDER INVOICE ERROR:", err);
    res.status(500).json({ message: "Failed to download invoice" });
  }
});

export default router;
