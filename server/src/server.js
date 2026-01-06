import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

// Config dotenv
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API is running...",
    status: "success",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

app.get("/api/v1/test", (req, res) => {
  res.json({
    message: "🚀 API is running...",
    data:{ name: "John Doe", age: 20 },
  });
});


// 404 Not Found
app.use((req, res) => {
  res.status(404).json({
    message: " Route not found",
    status: "fail",
    path: req.originalUrl,
  });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({
    message: "Internal server error",
    status: "error",
    error: process.env.NODE_ENV === "development" ? err.stack : null,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}`);
});

//
