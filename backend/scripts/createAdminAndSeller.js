const mongoose = require("mongoose");
const crypto = require("crypto");
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

// Helper function to hash password using crypto
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
};

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Define User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ["customer", "seller", "admin"],
    default: "customer",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Create admin and seller users
async function createUsers() {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ email: "admin@example.com" });
    if (!adminExists) {
      const admin = new User({
        name: "Admin User",
        email: "admin@example.com",
        password: hashPassword("admin123"),
        isAdmin: true,
        role: "admin",
      });
      await admin.save();
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }

    // Check if seller exists
    const sellerExists = await User.findOne({ email: "seller@example.com" });
    if (!sellerExists) {
      const seller = new User({
        name: "Seller User",
        email: "seller@example.com",
        password: hashPassword("seller123"),
        isAdmin: false,
        role: "seller",
      });
      await seller.save();
      console.log("Seller user created");
    } else {
      console.log("Seller user already exists");
    }

    // Create sample products if none exist
    const productsCount = await mongoose
      .model("Product", new mongoose.Schema({}))
      .countDocuments();
    if (productsCount === 0) {
      console.log("No products found. Creating sample products...");

      const Product = mongoose.model(
        "Product",
        new mongoose.Schema({
          name: String,
          description: String,
          price: Number,
          stock: Number,
          category: String,
          imageUrl: String,
          images: [String],
          seller: mongoose.Schema.Types.ObjectId,
          createdAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now },
        })
      );

      const seller = await User.findOne({ email: "seller@example.com" });

      const sampleProducts = [
        {
          name: "Smartphone X",
          description: "Latest smartphone with advanced features",
          price: 999.99,
          stock: 50,
          category: "Electronics",
          imageUrl: "https://via.placeholder.com/300",
          images: [
            "https://via.placeholder.com/300",
            "https://via.placeholder.com/300",
          ],
          seller: seller._id,
        },
        {
          name: "Laptop Pro",
          description: "High-performance laptop for professionals",
          price: 1499.99,
          stock: 30,
          category: "Electronics",
          imageUrl: "https://via.placeholder.com/300",
          images: [
            "https://via.placeholder.com/300",
            "https://via.placeholder.com/300",
          ],
          seller: seller._id,
        },
        {
          name: "Wireless Headphones",
          description: "Premium noise-cancelling headphones",
          price: 299.99,
          stock: 100,
          category: "Electronics",
          imageUrl: "https://via.placeholder.com/300",
          images: [
            "https://via.placeholder.com/300",
            "https://via.placeholder.com/300",
          ],
          seller: seller._id,
        },
      ];

      await Product.insertMany(sampleProducts);
      console.log("Sample products created");
    } else {
      console.log(`${productsCount} products already exist`);
    }

    console.log("Setup completed successfully");
  } catch (error) {
    console.error("Error creating users:", error);
  } finally {
    mongoose.disconnect();
  }
}

createUsers();
