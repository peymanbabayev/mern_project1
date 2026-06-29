import express from "express";
import {
    getKontragents,
    getKontragentById,
    createKontragent,
    updateKontragent,
    deleteKontragent
} from "../controllers/kontragent.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const kontragentRoutes = express.Router();

// Apply protect middleware to all routes
kontragentRoutes.use(protect);

// GET /api/kontragents
kontragentRoutes.get("/", authorizeRoles("admin", "viewer", "owner", "sales_manager", "sales_rep", "purchasing", "accountant"), getKontragents);

// POST /api/kontragents
kontragentRoutes.post("/", authorizeRoles("admin", "viewer", "owner", "sales_manager", "purchasing"), createKontragent);

// GET /api/kontragents/:id
kontragentRoutes.get("/:id", authorizeRoles("admin", "viewer", "owner", "sales_manager", "sales_rep", "purchasing", "accountant"), getKontragentById);

// PUT /api/kontragents/:id
kontragentRoutes.put("/:id", authorizeRoles("admin", "viewer", "owner", "sales_manager", "purchasing"), updateKontragent);

// DELETE /api/kontragents/:id
kontragentRoutes.delete("/:id", authorizeRoles("admin", "viewer", "owner"), deleteKontragent);

export default kontragentRoutes;
