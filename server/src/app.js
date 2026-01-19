import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { apiLimiter } from "../middleware/rateLimiter.js";

/* ================= ROUTES ================= */
import productRoutes from "../routes/productRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import adminOrderRoutes from "../routes/adminOrderRoutes.js";
import cartRoutes from "../routes/cartRoutes.js";
import sellRequestRoutes from "../routes/sellRequest.routes.js";
import adminSellRequestRoutes from "../routes/adminSellRequest.routes.js";

const app = express();

/* ================= CORE MIDDLEWARE ================= */
app.use(express.json());
app.use(cookieParser());

/* ================= SECURITY ================= */
app.use("/api", apiLimiter);

/* ================= CORS ================= */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* ================= HEALTH ================= */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

/* ================= PUBLIC ROUTES ================= */
app.use("/api/products", productRoutes);

/* ================= USER ROUTES ================= */
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/sell-requests", sellRequestRoutes);

/* ================= ADMIN ROUTES ================= */
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/sell-requests", adminSellRequestRoutes);
app.use("/api/admin", adminRoutes);

export default app;
