const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Use local MongoDB connection string directly
const LOCAL_MONGODB_URI =
  "mongodb://admin:password123@localhost:27017/ecommerce?authSource=admin";

console.log("Connecting to local MongoDB...");

// Connect to MongoDB
mongoose
  .connect(LOCAL_MONGODB_URI)
  .then(() => console.log("Connected to local MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Define Product schema (simplified for listing)
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model("Product", productSchema);

// List all products
async function listProducts() {
  try {
    console.log("Fetching products from local database...");
    const products = await Product.find({}).lean();

    console.log(`\nFound ${products.length} products:\n`);

    if (products.length === 0) {
      console.log("No products found in the local database.");
    } else {
      products.forEach((product, index) => {
        console.log(`Product ${index + 1}:`);
        console.log(`  ID: ${product._id}`);
        console.log(`  Name: ${product.name}`);
        console.log(`  Price: ${product.price}`);
        console.log(`  Category: ${product.category}`);
        console.log(`  Stock: ${product.stock}`);
        console.log(`  Seller: ${product.seller}`);
        console.log("  ---");
      });
    }

    // Also list users for debugging
    console.log("\nListing users for debugging:");
    const User = mongoose.model(
      "User",
      new mongoose.Schema({}, { strict: false })
    );
    const users = await User.find({}).lean();
    console.log(`Found ${users.length} users:`);
    users.forEach((user) => {
      console.log(
        `  ${user.name} (${user.email}) - Admin: ${user.isAdmin}, Role: ${user.role}`
      );
    });
  } catch (error) {
    console.error("Error listing products:", error);
  } finally {
    mongoose.disconnect();
  }
}

listProducts();
