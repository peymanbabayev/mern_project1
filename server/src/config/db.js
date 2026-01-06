import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) throw new Error("MONGO_URI is not defined in environment variables");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
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
