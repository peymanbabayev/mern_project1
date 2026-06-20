import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../src/models/user.model.js";

dotenv.config();

const users = [
  { name: "Demo Owner", username: "owner", email: "owner@demo.com", password: "password123", role: "owner", status: "approved" },
  { name: "Demo Accountant", username: "accountant", email: "accountant@demo.com", password: "password123", role: "accountant", status: "approved" },
  { name: "Demo Sales Manager", username: "sales_manager", email: "manager@demo.com", password: "password123", role: "sales_manager", status: "approved" },
  { name: "Demo Sales Rep", username: "sales_rep", email: "rep@demo.com", password: "password123", role: "sales_rep", status: "approved" },
  { name: "Demo Purchasing", username: "purchasing", email: "purchasing@demo.com", password: "password123", role: "purchasing", status: "approved" },
  { name: "Demo Warehouse", username: "warehouse", email: "warehouse@demo.com", password: "password123", role: "warehouse", status: "approved" },
  { name: "Demo Viewer", username: "viewer", email: "viewer@demo.com", password: "password123", role: "viewer", status: "approved" }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected");

    await User.deleteMany({});
    console.log("Existing users deleted");

    const salt = await bcrypt.genSalt(10);
    const usersWithHashedPasswords = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, salt)
    }));

    // We use insertMany directly and since we pre-hashed the passwords, we bypass the pre-save hook.
    // However, the pre-save hook only runs on User.save() or User.create() (which uses save internally).
    await User.insertMany(usersWithHashedPasswords);
    
    console.log("Demo users seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
