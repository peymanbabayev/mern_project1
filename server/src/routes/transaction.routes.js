import express from "express";
import {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction
} from "../controllers/transaction.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const transactionRoutes = express.Router();

transactionRoutes.use(protect);

// GET /api/transactions
transactionRoutes.get("/", authorizeRoles("admin", "viewer", "owner", "sales_manager", "sales_rep", "purchasing", "accountant"), getTransactions);

// POST /api/transactions
transactionRoutes.post("/", authorizeRoles("admin", "viewer", "owner", "sales_manager", "sales_rep", "purchasing"), createTransaction);

// GET /api/transactions/:id
transactionRoutes.get("/:id", authorizeRoles("admin", "viewer", "owner", "sales_manager", "sales_rep", "purchasing", "accountant"), getTransactionById);

// PUT /api/transactions/:id
transactionRoutes.put("/:id", authorizeRoles("admin", "viewer", "owner", "sales_manager", "purchasing"), updateTransaction);

// DELETE /api/transactions/:id
transactionRoutes.delete("/:id", authorizeRoles("admin", "viewer", "owner"), deleteTransaction);

export default transactionRoutes;
