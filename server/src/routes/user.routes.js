import express from "express";
import { toggleFavorite, getFavorites } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/favorites", protect, toggleFavorite);
router.get("/favorites", protect, getFavorites);

export default router;
