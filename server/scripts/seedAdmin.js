import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await Admin.findOne({
      email: "admin@sellphone.com",
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      process.exit();
    }

    await Admin.create({
      email: "admin@sellphone.com",
      password: "admin123",
    });

    console.log("✅ Admin created successfully");
    console.log("📧 Email: admin@sellphone.com");
    console.log("🔑 Password: admin123");

    process.exit();
  } catch (error) {
    console.error("❌ Failed to seed admin:", error);
    process.exit(1);
  }
};

seedAdmin();
