import express from "express";
import Rider from "../models/Rider.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* ======================================================
   GET ALL ACTIVE RIDERS (ADMIN)
====================================================== */
router.get("/", adminAuth, async (req, res) => {
  try {
    const riders = await Rider.find({ status: "active" }).sort({
      createdAt: 1,
    });

    res.json(riders);
  } catch (err) {
    console.error("FETCH RIDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch riders" });
  }
});

export default router;
