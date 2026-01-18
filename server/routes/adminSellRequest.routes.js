import express from "express";
import SellRequest from "../models/SellRequest.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* ADMIN VIEW ALL */
router.get("/", adminAuth, async (req, res) => {
  const requests = await SellRequest.find().sort({ createdAt: -1 });
  res.json(requests);
});

/* ADMIN UPDATE STATUS */
router.put("/:id", adminAuth, async (req, res) => {
  const { status, adminNotes } = req.body;

  const request = await SellRequest.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Not found" });

  request.status = status;
  request.adminNotes = adminNotes;

  request.statusHistory.push({
    status,
    changedBy: req.admin._id,
    note: adminNotes || "",
  });

  await request.save();
  res.json(request);
});

export default router;
