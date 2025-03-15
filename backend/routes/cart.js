const express = require("express");
const router = express.Router();
const passport = require("passport");
const Cart = require("../models/cart");

// Get user's cart
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let cart = await Cart.findOne({ user: req.user._id }).populate(
        "items.product"
      );
      if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
        await cart.save();
      }
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Add item to cart
router.post(
  "/add",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      let cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
      cart = await cart.populate("items.product");
      res.json(cart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update cart item quantity
router.put(
  "/update/:productId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { quantity } = req.body;
      const cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === req.params.productId
      );

      if (itemIndex === -1) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();
      const updatedCart = await cart.populate("items.product");
      res.json(updatedCart);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Remove item from cart
router.delete(
  "/remove/:productId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      cart.items = cart.items.filter(
        (item) => item.product.toString() !== req.params.productId
      );
      await cart.save();

      const updatedCart = await cart.populate("items.product");
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Clear cart
router.delete(
  "/clear",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      cart.items = [];
      await cart.save();
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
