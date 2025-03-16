const mongoose = require("mongoose");

console.log("Starting model initialization...");

// Import all models
console.log("Importing Cart model...");
const Cart = require("./cart");
console.log("Cart model imported:", Cart ? "success" : "failed");

console.log("Importing User model...");
const User = require("./user");
console.log("User model imported:", User ? "success" : "failed");

console.log("Importing Product model...");
const Product = require("./product");
console.log("Product model imported:", Product ? "success" : "failed");

console.log("Importing Order model...");
const Order = require("./order");
console.log("Order model imported:", Order ? "success" : "failed");

// Export models
module.exports = {
  Cart,
  User,
  Product,
  Order,
};

console.log("Model initialization complete.");
