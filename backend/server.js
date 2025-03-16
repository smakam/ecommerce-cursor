const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const path = require("path");

// Load environment variables based on NODE_ENV
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
const envPath = path.join(__dirname, envFile);
console.log("Loading environment from:", envPath);
dotenv.config({ path: envPath });

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);

// Import passport config
require("./config/passport");

// Passport middleware
app.use(passport.initialize());

// Initialize models
require("./models");

// Import routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    mongoose:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    models: Object.keys(mongoose.models),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Only connect to MongoDB if not in test mode
if (process.env.NODE_ENV !== "test") {
  // Connect to MongoDB and initialize models
  mongoose.set("debug", true); // Enable mongoose debug mode
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
      // Start server after successful connection
      const PORT = process.env.PORT || 5001;
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
}

module.exports = app;
