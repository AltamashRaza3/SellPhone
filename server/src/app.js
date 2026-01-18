import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { apiLimiter } from "../middleware/rateLimiter.js";

/* Routes */
import productRoutes from "../routes/productRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import adminOrderRoutes from "../routes/adminOrderRoutes.js";
import cartRoutes from "../routes/cartRoutes.js";
import sellRequestRoutes from "../routes/sellRequest.routes.js";
import adminSellRequestRoutes from "../routes/adminSellRequest.routes.js";


dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(cookieParser());


/* 🔐 GLOBAL RATE LIMITER */
app.use("/api", apiLimiter);

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
app.use("/api/sell-requests", sellRequestRoutes);
app.use("/api/admin/sell-requests", adminSellRequestRoutes);
/* ================= DB ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

export default app;
