import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import invoiceRoutes from "../routes/invoice.routes.js";
import adminProductsRoutes from "../routes/adminProducts.routes.js";
import adminInvoiceRoutes from "../routes/adminInvoice.routes.js";

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
import adminInventoryRoutes from "../routes/admin.inventory.routes.js";

import riderRoutes from "../routes/rider.routes.js";

/* ================= PATH FIX (ESM) ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("trust proxy",1);
/* ================= CORE ================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ================= SECURITY ================= */
app.use("/api", apiLimiter);

const corsOptions = {
  origin: [
    "http://localhost:5174", 
    "http://localhost:5173",
    "https://salephone-cf695.web.app",
    "https://salephone-cf695.firebaseapp.com",
    "https://salephone-cf695.firebaseapp.com/admin/login",
    "https://salephone-cf695.firebaseapp.com/admin/",
    "https://altamashraza3.github.io/SellPhone/#/login",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

/* ================= STATIC FILES ================= */

// project root (/sellphone)
const PROJECT_ROOT = path.resolve(__dirname, "..");
app.use(
  "/uploads",
  express.static(path.join(PROJECT_ROOT, "uploads"), {
    index: false,
    maxAge: "7d",
  })
);


/* ================= HEALTH CHECK ================= */
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ================= AUTH ================= */
app.use("/api/auth", authRoutes);

/* ================= PUBLIC ================= */
app.use("/api/products", productRoutes);

/* ================= USER ================= */
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/sell-requests", sellRequestRoutes);
app.use("/api/invoices", invoiceRoutes);
/* ================= ADMIN ================= */
app.use("/api/admin", adminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/sell-requests", adminSellRequestRoutes);
app.use("/api/admin/riders", adminRiderRoutes);
app.use("/api/admin/inventory", adminInventoryRoutes);
app.use("/api/admin", adminProductsRoutes);
app.use("/api/invoices", adminInvoiceRoutes);
/* ================= RIDER ================= */
app.use("/api/rider", riderRoutes);

/* ================= 404 FALLBACK ================= */
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

export default app;
