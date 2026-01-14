import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import productRoutes from "../routes/productRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";

dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(cookieParser());

/* ================= Cookies ================= */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // 🔥 REQUIRED
  })
);

/* ================= ROUTES ================= */
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.send("API Running");
});

/* ================= DB ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

export default app;
