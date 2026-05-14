import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
  const MONGO_URL = config.database.mongoUrl;
  if (!MONGO_URL) throw new Error("MONGO_URL is not defined");

  // Müvəqqəti — URL-i yoxlamaq üçün
  console.log("🔗 Connecting to:", MONGO_URL.substring(0, 50) + "...");

  try {
    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 10000, // 10 saniyədə xəta ver
      connectTimeoutMS: 10000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message); // ← error.message əlavə et
    process.exit(1);
  }
};
mongoose.connection.on("error", (error) => {
  console.error("MongoDB runtime error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

export default connectDB;
