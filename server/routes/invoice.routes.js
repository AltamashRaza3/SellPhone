import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import SellRequest from "../src/models/SellRequest.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";

const router = express.Router();

/* ================= PATH FIX ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/routes → ../../ → project root
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

/* ================= GET INVOICE ================= */
router.get("/:id", async (req, res) => {
  try {
    const sellRequest = await SellRequest.findById(req.params.id);

    if (!sellRequest) {
      return res.status(404).json({ message: "Sell request not found" });
    }

    if (sellRequest.pickup?.status !== "Completed") {
      return res
        .status(400)
        .json({ message: "Invoice available only after pickup completion" });
    }

    // 🔥 GENERATE OR FETCH INVOICE
    const invoice = await generateInvoice(sellRequest);

    // ✅ CORRECT ABSOLUTE PATH
    const filePath = path.join(PROJECT_ROOT, invoice.url);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Invoice not available" });
    }

    // ✅ FORCE DOWNLOAD (NO JSON TAB)
    res.download(filePath, path.basename(filePath));
  } catch (err) {
    console.error("INVOICE ERROR:", err);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
});

export default router;
