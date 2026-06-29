import express from "express";
import { getTasks, completeTask } from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const taskRoutes = express.Router();

// Bütün tapşırıqları gətir
taskRoutes.get("/", protect, getTasks);

// Tapşırığı tamamla
taskRoutes.post("/:id/complete", protect, completeTask);

export default taskRoutes;
