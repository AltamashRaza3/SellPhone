import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

/* ================= MIDDLEWARE ================= */
import { apiLimiter } from "../middleware/rateLimiter.js";

/* ================= ROUTES ================= */
import authRoutes from "../routes/auth.routes.js";

import productRoutes from "../routes/productRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import cartRoutes from "../routes/cartRoutes.js";
import sellRequestRoutes from "../routes/sellRequest.routes.js";

import adminRoutes from "../routes/adminRoutes.js";
import adminOrderRoutes from "../routes/adminOrderRoutes.js";
import adminSellRequestRoutes from "../routes/adminSellRequest.routes.js";
import adminRiderRoutes from "../routes/adminRider.routes.js";

import riderRoutes from "../routes/rider.routes.js";

/* ================= PATH FIX FOR ESM ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ================= CORE ================= */
app.use(express.json());
app.use(cookieParser());

/* ================= SECURITY ================= */
app.use("/api", apiLimiter);

/* ================= CORS (FINAL & CORRECT) ================= */
/*
  Client App  → http://localhost:5174
  Rider App   → http://localhost:5173
  Backend     → http://localhost:5000
*/
app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ================= STATIC FILES ================= */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* ================= HEALTH CHECK ================= */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
  });
});

/* ================= AUTH ================= */
/* Firebase → Backend session bridge */
app.use("/api/auth", authRoutes);

/* ================= PUBLIC ================= */
app.use("/api/products", productRoutes);

/* ================= USER ================= */
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/sell-requests", sellRequestRoutes);

/* ================= ADMIN ================= */
app.use("/api/admin", adminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/sell-requests", adminSellRequestRoutes);
app.use("/api/admin/riders", adminRiderRoutes);

/* ================= RIDER ================= */
app.use("/api/rider", riderRoutes);

/* ================= FALLBACK ================= */
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

export default app;
