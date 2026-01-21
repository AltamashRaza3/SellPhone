import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

/* ================= MIDDLEWARE ================= */
import { apiLimiter } from "../middleware/rateLimiter.js";

/* ================= ROUTES ================= */
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

/* ================= CORS ================= */
const allowedOrigins = [
  "http://localhost:5173", // Client app
  "http://localhost:5174", // Rider app
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ================= STATIC FILES (IMAGE UPLOADS) ================= */
/* 🔥 REQUIRED FOR MULTER UPLOADS 🔥 */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* ================= HEALTH ================= */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
  });
});

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
