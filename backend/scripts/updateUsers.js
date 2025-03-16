require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");

const MONGODB_URI =
  "mongodb://admin:password123@localhost:27017/ecommerce?authSource=admin";

const updateUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Update admin user
    const adminUser = await User.findOneAndUpdate(
      { email: "admin@example.com" },
      {
        $set: {
          isAdmin: true,
          role: "admin",
        },
      },
      { new: true }
    );
    console.log("Admin user updated:", adminUser ? adminUser : "Not found");

    // Update seller user
    const sellerUser = await User.findOneAndUpdate(
      { email: "seller@example.com" },
      {
        $set: {
          isAdmin: false,
          role: "seller",
        },
      },
      { new: true }
    );
    console.log("Seller user updated:", sellerUser ? sellerUser : "Not found");

    console.log("Updates completed");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

updateUsers();
