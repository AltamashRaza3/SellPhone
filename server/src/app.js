import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

/* ================= ROUTES ================= */
import invoiceRoutes from "../routes/invoice.routes.js";
import adminProductsRoutes from "../routes/adminProducts.routes.js";
import adminInvoiceRoutes from "../routes/adminInvoice.routes.js";

import { apiLimiter } from "../middleware/rateLimiter.js";

import authRoutes from "../routes/auth.routes.js";
import productRoutes from "../routes/productRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import cartRoutes from "../routes/cartRoutes.js";
import sellRequestRoutes from "../routes/sellRequest.routes.js";

import adminRoutes from "../routes/adminRoutes.js";
import adminOrderRoutes from "../routes/adminOrderRoutes.js";
import adminSellRequestRoutes from "../routes/adminSellRequest.routes.js";
import adminRiderRoutes from "../routes/adminRider.routes.js";
import adminAlertRoutes from "../routes/adminAlert.routes.js";
import adminInventoryRoutes from "../routes/admin.inventory.routes.js";

import riderRoutes from "../routes/rider.routes.js";

/* ================= PATH FIX ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("trust proxy", 1);

/* =========================================================
   SECURITY HEADERS (Helmet)
========================================================= */
app.use(
  helmet({
    contentSecurityPolicy: false, // disable if loading external images
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

/* =========================================================
   RESPONSE COMPRESSION
========================================================= */
app.use(compression());

/* =========================================================
   BODY LIMIT PROTECTION
========================================================= */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

/* =========================================================
   COOKIE PARSER
========================================================= */
app.use(cookieParser());

/* =========================================================
   SIMPLE NoSQL SANITIZER (Safe for Node 20+)
========================================================= */
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== "object") return;

    Object.keys(obj).forEach((key) => {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        sanitize(obj[key]);
      }
    });
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
});

/* =========================================================
   HPP (HTTP PARAMETER POLLUTION PROTECTION)
========================================================= */
app.use(hpp());

/* =========================================================
   RATE LIMITING
========================================================= */
app.use("/api", apiLimiter);

/* =========================================================
   STRICT CORS CONFIGURATION
========================================================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://salephone-cf695.web.app",
  "https://salephone-cf695.firebaseapp.com",
  "https://altamashraza3.github.io",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =========================================================
   STATIC FILES
========================================================= */
const PROJECT_ROOT = path.resolve(__dirname, "..");

app.use(
  "/uploads",
  express.static(path.join(PROJECT_ROOT, "uploads"), {
    index: false,
    maxAge: "7d",
  })
);

/* =========================================================
   HEALTH CHECK
========================================================= */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   ROUTES
========================================================= */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/sell-requests", sellRequestRoutes);
app.use("/api/invoices", invoiceRoutes);

/* ================= ADMIN ================= */
app.use("/api/admin/riders", adminRiderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/sell-requests", adminSellRequestRoutes);
app.use("/api/admin/inventory", adminInventoryRoutes);
app.use("/api/admin/alerts", adminAlertRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminProductsRoutes);
app.use("/api/invoices", adminInvoiceRoutes);

/* ================= RIDER ================= */
app.use("/api/rider", riderRoutes);

/* =========================================================
   404 HANDLER
========================================================= */
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  res.status(err.status || 500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

export default app;
