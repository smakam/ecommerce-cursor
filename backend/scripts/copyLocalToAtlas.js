const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Connection strings
const LOCAL_MONGODB_URI =
  "mongodb://admin:password123@localhost:27017/ecommerce?authSource=admin";

// Load environment variables for Atlas connection
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
const envPath = path.join(__dirname, "..", envFile);
console.log("Loading environment from:", envPath);
dotenv.config({ path: envPath });

const ATLAS_MONGODB_URI = process.env.MONGODB_URI;

// Create connections to both databases
const localConnection = mongoose.createConnection(LOCAL_MONGODB_URI);
const atlasConnection = mongoose.createConnection(ATLAS_MONGODB_URI);

// Define schemas for both connections (simplified for copying)
const userSchema = new mongoose.Schema({}, { strict: false });
const productSchema = new mongoose.Schema({}, { strict: false });
const cartSchema = new mongoose.Schema({}, { strict: false });
const orderSchema = new mongoose.Schema({}, { strict: false });

// Create models for both connections
const LocalUser = localConnection.model("User", userSchema);
const LocalProduct = localConnection.model("Product", productSchema);
const LocalCart = localConnection.model("Cart", cartSchema);
const LocalOrder = localConnection.model("Order", orderSchema);

const AtlasUser = atlasConnection.model("User", userSchema);
const AtlasProduct = atlasConnection.model("Product", productSchema);
const AtlasCart = atlasConnection.model("Cart", cartSchema);
const AtlasOrder = atlasConnection.model("Order", orderSchema);

// Copy data from local to Atlas
async function copyData() {
  try {
    console.log("Connected to both databases");

    // Clear existing data in Atlas
    console.log("Clearing existing data in Atlas...");
    await AtlasUser.deleteMany({});
    await AtlasProduct.deleteMany({});
    await AtlasCart.deleteMany({});
    await AtlasOrder.deleteMany({});

    // Copy users
    console.log("Copying users...");
    const users = await LocalUser.find({}).lean();
    if (users.length > 0) {
      await AtlasUser.insertMany(users);
      console.log(`Copied ${users.length} users`);
    } else {
      console.log("No users found to copy");
    }

    // Copy products
    console.log("Copying products...");
    const products = await LocalProduct.find({}).lean();
    if (products.length > 0) {
      await AtlasProduct.insertMany(products);
      console.log(`Copied ${products.length} products`);
    } else {
      console.log("No products found to copy");
    }

    // Copy carts
    console.log("Copying carts...");
    const carts = await LocalCart.find({}).lean();
    if (carts.length > 0) {
      await AtlasCart.insertMany(carts);
      console.log(`Copied ${carts.length} carts`);
    } else {
      console.log("No carts found to copy");
    }

    // Copy orders
    console.log("Copying orders...");
    const orders = await LocalOrder.find({}).lean();
    if (orders.length > 0) {
      await AtlasOrder.insertMany(orders);
      console.log(`Copied ${orders.length} orders`);
    } else {
      console.log("No orders found to copy");
    }

    console.log("Data copy completed successfully!");
  } catch (error) {
    console.error("Error copying data:", error);
  } finally {
    // Close connections
    await localConnection.close();
    await atlasConnection.close();
    console.log("Database connections closed");
  }
}

// Run the copy function
copyData();
