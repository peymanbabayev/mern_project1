import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
  const MONGO_URL = config.database.mongoUrl;
  if (!MONGO_URL) throw new Error("MONGO_URL is not defined in environment variables");

  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB initial connection error:", error);
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
