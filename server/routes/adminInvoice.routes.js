import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import Order from "../models/Order.js";
import adminAuth from "../middleware/adminAuth.js";
import { generateOrderInvoice } from "../utils/generateOrderInvoice.js";

const router = express.Router();

/* ================= PATH FIX (ESM) ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// project root → sellphone/
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

/* ======================================================
   ADMIN – DOWNLOAD ORDER INVOICE
   GET /api/invoices/admin/order/:id
====================================================== */
router.get("/admin/order/:id", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "Delivered") {
      return res
        .status(400)
        .json({ message: "Invoice available only after delivery" });
    }

    /* ================= ENSURE INVOICE ================= */
    if (!order.invoiceGenerated || !order.invoiceUrl) {
      const invoice = await generateOrderInvoice(order);

      order.invoiceGenerated = true;
      order.invoiceNumber = invoice.number;
      order.invoiceUrl = invoice.url;
      await order.save();
    }

    const filePath = path.join(PROJECT_ROOT, order.invoiceUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Invoice file not found" });
    }

    res.download(filePath, `${order.invoiceNumber}.pdf`);
  } catch (err) {
    console.error("❌ ADMIN ORDER INVOICE ERROR:", err);
    res.status(500).json({ message: "Failed to download invoice" });
  }
});

export default router;
