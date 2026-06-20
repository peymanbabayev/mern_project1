import express from "express";
import { 
    createProduct, 
    deleteProduct, 
    getAllProducts, 
    getProductById, 
    updateProduct, 
    getProductStats,
    updateCostPrice,
    proposePrice,
    approvePriceProposal,
    updateStock
} from "../controllers/product.controller.js";
import upload from "../middleware/upload.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const productRoutes = express.Router();

// GET /api/products/stats - Get product statistics
productRoutes.get("/stats", protect, getProductStats);

// POST /api/products - Create new product
productRoutes.post("/", protect, authorizeRoles("admin", "viewer", "owner", "accountant"), upload.single("image"), createProduct);

// GET /api/products - Get all products
productRoutes.get("/", protect, getAllProducts);

// GET /api/products/:id - Get single product
productRoutes.get("/:id", protect, getProductById);

// PUT /api/products/:id/cost - Update cost price
productRoutes.put("/:id/cost", protect, authorizeRoles("admin", "viewer", "owner", "accountant"), updateCostPrice);

// PUT /api/products/:id/propose-price - Propose sale price
productRoutes.put("/:id/propose-price", protect, authorizeRoles("sales_rep", "sales_manager", "admin", "viewer", "owner"), proposePrice);

// PUT /api/products/:id/approve-price/:proposalId - Approve price proposal
productRoutes.put("/:id/approve-price/:proposalId", protect, authorizeRoles("admin", "viewer", "owner"), approvePriceProposal);

// PUT /api/products/:id/stock - Update stock count
productRoutes.put("/:id/stock", protect, authorizeRoles("admin", "viewer", "owner", "warehouse", "purchasing"), updateStock);

// PUT /api/products/:id - Update product (general info like name, image)
productRoutes.put("/:id", protect, authorizeRoles("admin", "viewer", "owner"), upload.single("image"), updateProduct);

// DELETE /api/products/:id - Delete product
productRoutes.delete("/:id", protect, authorizeRoles("admin", "viewer", "owner"), deleteProduct);

export default productRoutes;