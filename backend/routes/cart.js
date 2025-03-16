const express = require("express");
const router = express.Router();
const passport = require("passport");
const Cart = require("../models/Cart");

// Middleware to protect routes
const auth = passport.authenticate("jwt", { session: false });

// Get user's cart
router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOrCreateCart(req.user._id);
    res.json({ success: true, cart });
  } catch (error) {
    console.error("Error in cart route:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error fetching cart",
        details: error.message,
      },
    });
  }
});

// Add item to cart
router.post("/add", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        error: { message: "Product ID and quantity are required" },
      });
    }

    let cart = await Cart.findOrCreateCart(req.user._id);
    cart = await cart.addOrUpdateItem(productId, quantity);

    res.json({ success: true, cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error adding item to cart",
        details: error.message,
      },
    });
  }
});

// Update item quantity
router.put("/update/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    let cart = await Cart.findOrCreateCart(req.user._id);
    cart = await cart.updateItemQuantity(productId, quantity);

    if (!cart) {
      cart = await Cart.findOrCreateCart(req.user._id);
    }

    res.json({ success: true, cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error updating cart item",
        details: error.message,
      },
    });
  }
});

// Remove item from cart
router.delete("/remove/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;
    let cart = await Cart.findOrCreateCart(req.user._id);
    cart = await cart.removeItem(productId);

    if (!cart) {
      cart = await Cart.findOrCreateCart(req.user._id);
    }

    res.json({ success: true, cart });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error removing item from cart",
        details: error.message,
      },
    });
  }
});

// Clear cart
router.delete("/clear", auth, async (req, res) => {
  try {
    let cart = await Cart.findOrCreateCart(req.user._id);
    cart = await cart.clearCart();

    res.json({ success: true, cart });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error clearing cart",
        details: error.message,
      },
    });
  }
});

module.exports = router;
