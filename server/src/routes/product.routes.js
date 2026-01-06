import express from "express";
import { createProduct, deleteProduct, getAllProducts, updateProduct } from "../controllers/product.controller.js";

const productRoutes = express.Router();

// POST /api/v1/products - Create new product
productRoutes.post("/", createProduct);

// DELETE /api/v1/products/:id - Delete product
productRoutes.delete("/:id", deleteProduct);

// GET /api/v1/products - Get all products
productRoutes.get("", getAllProducts);

// PUT /api/v1/products/:id - Update product
productRoutes.put("/:id", updateProduct);

export default productRoutes;