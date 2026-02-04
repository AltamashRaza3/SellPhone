import express from "express";
import { getAllProductsAdmin } from "../controllers/productController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/products", adminAuth, getAllProductsAdmin);

export default router;
