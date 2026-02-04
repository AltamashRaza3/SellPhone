import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
} from "../controllers/productController.js";

const router = express.Router();

/* ================= PUBLIC ================= */
router.get("/", getProducts);
router.get("/:id", getProductById);

/* ================= ADMIN ================= */
router.post("/", adminAuth, createProduct);
router.get("/admin/all", adminAuth, getAllProductsAdmin);
router.put("/:id", adminAuth, updateProduct);
router.delete("/:id", adminAuth, deleteProduct);

export default router;
