const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables based on NODE_ENV
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
const envPath = path.join(__dirname, "..", envFile);
console.log("Loading environment from:", envPath);
dotenv.config({ path: envPath });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
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
    console.log("Fetching products from database...");
    const products = await Product.find({}).lean();

    console.log(`\nFound ${products.length} products:\n`);

    if (products.length === 0) {
      console.log("No products found in the database.");
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
