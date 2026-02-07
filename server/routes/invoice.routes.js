import express from "express";
import path from "path";
import fs from "fs";

import SellRequest from "../src/models/SellRequest.js";
import Order from "../models/Order.js";

import { generateInvoice } from "../utils/generateSellInvoice.js";
import { generateOrderInvoice } from "../utils/generateOrderInvoice.js";

import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();
const PROJECT_ROOT = process.cwd();

/* ======================================================
   SELL PHONE INVOICE (USER – FILE)
====================================================== */
router.get("/sell/:id", userAuth, async (req, res) => {
  try {
    const sellRequest = await SellRequest.findById(req.params.id);
    if (!sellRequest) return res.status(404).json({ message: "Sell request not found" });

    if (sellRequest.user.uid !== req.user.uid)
      return res.status(403).json({ message: "Access denied" });

    if (sellRequest.pickup?.status !== "Completed")
      return res.status(400).json({ message: "Invoice available only after pickup" });

    const invoice = await generateInvoice(sellRequest);
    const filePath = path.join(PROJECT_ROOT, invoice.url);

    if (!fs.existsSync(filePath))
      return res.status(404).json({ message: "Invoice not found" });

    return res.download(filePath);
  } catch (err) {
    console.error("SELL INVOICE ERROR:", err);
    res.status(500).json({ message: "Failed to download invoice" });
  }
});

/* ======================================================
   ORDER INVOICE (USER – STREAM, NO FS, NO URL)
====================================================== */
router.get("/order/:id", userAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.uid !== req.user.uid) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (order.status !== "Delivered") {
      return res
        .status(400)
        .json({ message: "Invoice available only after delivery" });
    }

    const doc = await generateOrderInvoice(order);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ORD-INV-${order._id.toString().slice(-6)}.pdf`
    );

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error("❌ ORDER INVOICE ERROR:", err);
    res.status(500).json({ message: "Failed to download invoice" });
  }
});


/* ======================================================
   ORDER INVOICE (ADMIN – FILE)
====================================================== */
router.get("/admin/order/:id", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Delivered")
      return res.status(400).json({ message: "Invoice available only after delivery" });

    if (!order.invoiceGenerated) {
      const invoice = await generateOrderInvoice(order);

      await Order.updateOne(
        { _id: order._id },
        {
          invoiceGenerated: true,
          invoiceNumber: invoice.number,
          invoiceUrl: invoice.url,
        }
      );

      order.invoiceUrl = invoice.url;
    }

    const filePath = path.join(PROJECT_ROOT, order.invoiceUrl);
    if (!fs.existsSync(filePath))
      return res.status(404).json({ message: "Invoice not found" });

    return res.download(filePath);
  } catch (err) {
    console.error("ADMIN ORDER INVOICE ERROR:", err);
    res.status(500).json({ message: "Failed to download invoice" });
  }
});

export default router;
