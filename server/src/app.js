import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

/* Routes */
import productRoutes from "../routes/productRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import adminOrderRoutes from "../routes/adminOrderRoutes.js";
import cartRoutes from "../routes/cartRoutes.js";

dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(cookieParser());

/* ================= CORS ================= */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // 🔥 REQUIRED for cookies
  })
);

/* ================= ROUTES ================= */

/* Public */
app.use("/api/products", productRoutes);

/* User */
app.use("/api/orders", orderRoutes);

/* Admin Auth */
app.use("/api/admin", adminRoutes);

/* Admin Orders (Phase 11C) */
app.use("/api/admin/orders", adminOrderRoutes);


app.use("/api/cart", cartRoutes);
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
