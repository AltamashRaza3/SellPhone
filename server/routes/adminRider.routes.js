import express from "express";
import Rider from "../models/Rider.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* ======================================================
   GET ALL RIDERS (ADMIN)
   ?status=active | inactive | all
====================================================== */
router.get("/", adminAuth, async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status === "active") filter.status = "active";
    if (status === "inactive") filter.status = "inactive";

    const riders = await Rider.find(filter).sort({ createdAt: 1 });
    res.json(riders);
  } catch (err) {
    console.error("FETCH RIDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch riders" });
  }
});

/* ======================================================
   CREATE RIDER (ADMIN)
====================================================== */
router.post("/", adminAuth, async (req, res) => {
  try {
    const { name, phone, city } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required",
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone must be 10 digits",
      });
    }

    const existing = await Rider.findOne({ phone });
    if (existing) {
      return res.status(409).json({
        message: "Rider with this phone already exists",
      });
    }

    const rider = await Rider.create({
      name: name.trim(),
      phone: phone.trim(),
      city: city?.trim(),
      status: "active",
      createdBy: "admin",
    });

    res.status(201).json(rider);
  } catch (err) {
    console.error("CREATE RIDER ERROR:", err);
    res.status(500).json({ message: "Failed to create rider" });
  }
});

/* ======================================================
   UPDATE RIDER BASIC INFO (ADMIN)
====================================================== */
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { name, city } = req.body;

    const rider = await Rider.findById(req.params.id);
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    if (name !== undefined) rider.name = name.trim();
    if (city !== undefined) rider.city = city.trim();

    await rider.save();
    res.json(rider);
  } catch (err) {
    console.error("UPDATE RIDER ERROR:", err);
    res.status(500).json({ message: "Failed to update rider" });
  }
});

/* ======================================================
   ACTIVATE / DEACTIVATE RIDER (ADMIN)
====================================================== */
router.patch("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const rider = await Rider.findByIdAndUpdate(
      req.params.id,
      {
        status,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: req.admin?._id || "admin",
      },
      { new: true }
    );

    if (!rider) {
      return res.status(404).json({ message: "Rider not found" });
    }

    res.json(rider);
  } catch (err) {
    console.error("UPDATE RIDER STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update rider status" });
  }
});

export default router;
