import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import config, { validateConfig } from "./config/config.js";
import connectDB from "./config/db.js";
import productRoutes from "./routes/product.routes.js";

// Validate configuration
validateConfig();

console.log("🛠️ Server Config:", {
  port: config.server.port,
  clientUrl: config.cors.clientUrl,
  env: config.server.nodeEnv
});

const app = express();
const PORT = config.server.port;

// CORS Configuration
const corsOptions = {
  origin: true, // Allow all origins for debugging
  credentials: config.cors.credentials,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(config.upload.uploadDir)); // Make uploads folder public

// Routes
app.get("/", (req, res) => {
  res.json({ message: "🚀 API is running...", status: "success", database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" });
});

// Products routes
app.use("/api/products", productRoutes);

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({ message: " Route not found", status: "fail", path: req.originalUrl });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: "Internal server error", status: "error", error: config.server.isDevelopment ? err.stack : null });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startServer();