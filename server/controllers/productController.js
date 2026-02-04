import Product from "../models/Product.js";

/* ======================================================
   CREATE PRODUCT (ADMIN MANUAL)
====================================================== */
export const createProduct = async (req, res) => {
  try {
 const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({
      message: error.message,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      errors: error.errors,
    });
  }
};


/* ======================================================
   GET ALL PUBLISHED PRODUCTS (Home Page)
   GET /api/products
====================================================== */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "Published" })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

/* ======================================================
   GET SINGLE PRODUCT (Details Page)
   GET /api/products/:id
====================================================== */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.status !== "Published") {
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
/* ======================================================
   GET ALL PRODUCTS (ADMIN)
   GET /api/products/admin/all
====================================================== */
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch admin products",
      error: error.message,
    });
  }
};
