import express from "express";
import { toggleFavorite, getFavorites, getPendingUsers, updateUserStatus, updateUserRole } from "../controllers/user.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/favorites", protect, toggleFavorite);
router.get("/favorites", protect, getFavorites);

// Admin Routes
router.get("/pending", protect, authorizeRoles("admin"), getPendingUsers);
router.put("/:id/status", protect, authorizeRoles("admin"), updateUserStatus);
router.put("/:id/role", protect, authorizeRoles("admin"), updateUserRole);

export default router;
