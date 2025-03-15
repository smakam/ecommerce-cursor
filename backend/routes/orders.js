const express = require("express");
const router = express.Router();
const passport = require("passport");
const Order = require("../models/order");
const Cart = require("../models/cart");
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Get user's orders
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const orders = await Order.find({ user: req.user._id })
        .populate("items.product")
        .sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get single order
router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
      }).populate("items.product");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Create order
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { shippingAddress, paymentMethod } = req.body;
      const cart = await Cart.findOne({ user: req.user._id }).populate(
        "items.product"
      );

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const totalAmount = cart.items.reduce((total, item) => {
        return total + item.product.price * item.quantity;
      }, 0);

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100, // Convert to paise
        currency: "INR",
        receipt: `order_${Date.now()}`,
      });

      const order = new Order({
        user: req.user._id,
        items: cart.items,
        totalAmount,
        shippingAddress,
        paymentMethod,
        razorpayOrderId: razorpayOrder.id,
        status: "pending",
      });

      await order.save();

      // Clear the cart after order creation
      cart.items = [];
      await cart.save();

      res.status(201).json({
        order,
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update order status (verify payment)
router.post(
  "/:id/verify-payment",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { razorpayPaymentId, razorpaySignature } = req.body;
      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify payment signature
      const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
      hmac.update(order.razorpayOrderId + "|" + razorpayPaymentId);
      const generatedSignature = hmac.digest("hex");

      if (generatedSignature === razorpaySignature) {
        order.status = "paid";
        order.paymentDetails = {
          paymentId: razorpayPaymentId,
          signature: razorpaySignature,
        };
        await order.save();
        res.json({ message: "Payment verified successfully" });
      } else {
        res.status(400).json({ message: "Invalid payment signature" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
