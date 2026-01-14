import Product from "../models/Product.js";

/* ======================================================
   CREATE PRODUCT (Admin)
   POST /api/products
   ====================================================== */
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      isActive: req.body.isActive ?? true,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({
      message: "Product creation failed",
      error: error.message,
    });
  }
};

/* ======================================================
   GET ALL ACTIVE PRODUCTS (Public / Home)
   GET /api/products
   ====================================================== */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

/* ======================================================
   GET SINGLE PRODUCT BY ID
   GET /api/products/:id
   ====================================================== */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({
      message: "Invalid product ID",
      error: error.message,
    });
  }
};

/* ======================================================
   UPDATE PRODUCT (Admin)
   PUT /api/products/:id
   ====================================================== */
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

/* ======================================================
   DELETE PRODUCT (Admin)
   DELETE /api/products/:id
   ====================================================== */
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};
