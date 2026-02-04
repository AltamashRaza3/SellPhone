import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import SellRequest from "../src/models/SellRequest.js";
import Order from "../models/Order.js";

import { generateInvoice } from "../utils/generateSellInvoice.js";
import { generateOrderInvoice } from "../utils/generateOrderInvoice.js";

import userAuth from "../middleware/userAuth.js";

const router = express.Router();

/* ================= PATH FIX ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..","..");

/* ======================================================
   SELL PHONE INVOICE
   GET /api/invoices/sell/:id
====================================================== */
router.get("/sell/:id", userAuth, async (req, res) => {
  try {
    const sellRequest = await SellRequest.findById(req.params.id);

    if (!sellRequest) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    if (sellRequest.user.uid !== req.user.uid) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (sellRequest.pickup?.status !== "Completed") {
      return res
        .status(400)
        .json({ message: "Invoice available only after pickup completion" });
    }

    const invoice = await generateInvoice(sellRequest);
    const filePath = path.join(PROJECT_ROOT, invoice.url);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.download(filePath);
  } catch (err) {
    console.error("SELL INVOICE ERROR:", err);
    res.status(500).json({ message: "Failed to download invoice" });
  }
});

/* ======================================================
   ORDER INVOICE (BUY)
   GET /api/invoices/order/:orderId
====================================================== */
router.get("/order/:id", userAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

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

    // generate once (safe)
    if (!order.invoiceGenerated) {
      const invoice = await generateOrderInvoice(order);
      order.invoiceGenerated = true;
      order.invoiceNumber = invoice.number;
      order.invoiceUrl = invoice.url;
      await order.save();
    }

    const filePath = path.join(PROJECT_ROOT, order.invoiceUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.download(filePath);
  } catch (err) {
    console.error("ORDER INVOICE ERROR:", err);
    res.status(500).json({ message: "Failed to download invoice" });
  }
});

export default router;
