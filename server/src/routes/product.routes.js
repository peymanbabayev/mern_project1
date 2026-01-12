import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/product.controller.js";
import upload from "../middleware/upload.js";

const productRoutes = express.Router();

// POST /api/products - Create new product
productRoutes.post("/", upload.single("image"), createProduct);

// GET /api/products - Get all products
productRoutes.get("/", getAllProducts);

// GET /api/products/:id - Get single product
productRoutes.get("/:id", getProductById);

// PUT /api/products/:id - Update product
productRoutes.put("/:id", upload.single("image"), updateProduct);

// DELETE /api/products/:id - Delete product
productRoutes.delete("/:id", deleteProduct);

export default productRoutes;