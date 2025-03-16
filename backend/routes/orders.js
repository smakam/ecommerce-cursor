const express = require("express");
const router = express.Router();
const passport = require("passport");
const crypto = require("crypto");
const Order = require("../models/order");
const Cart = require("../models/Cart");
const Razorpay = require("razorpay");
const User = require("../models/user");
const Product = require("../models/product");

// Check if Razorpay credentials are available
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("Razorpay credentials are missing in environment variables");
  console.log("Current environment:", process.env.NODE_ENV);
  console.log("RAZORPAY_KEY_ID exists:", !!process.env.RAZORPAY_KEY_ID);
  console.log("RAZORPAY_KEY_ID value:", process.env.RAZORPAY_KEY_ID);
  console.log("RAZORPAY_KEY_SECRET exists:", !!process.env.RAZORPAY_KEY_SECRET);
  console.log("RAZORPAY_KEY_SECRET value:", process.env.RAZORPAY_KEY_SECRET);
  throw new Error("Razorpay credentials are required to start the server");
}

// Initialize Razorpay with credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID.trim(),
  key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
});

// Get user's orders
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      console.log("Fetching orders for user:", req.user._id);

      // Get orders without population first
      const orders = await Order.find({ user: req.user._id })
        .lean()
        .sort({ createdAt: -1 });
      console.log(`Found ${orders.length} orders for user`);

      // Log the first order to see its structure
      if (orders.length > 0) {
        console.log(
          "First user order structure:",
          JSON.stringify(orders[0], null, 2)
        );
      }

      // Map the orders to a consistent format
      const formattedOrders = orders.map((order) => {
        // Check which schema the order follows
        const hasOrderItems = order.orderItems && order.orderItems.length > 0;
        const hasItems = order.items && order.items.length > 0;

        return {
          _id: order._id,
          user: order.user,
          orderItems: hasOrderItems
            ? order.orderItems
            : hasItems
            ? order.items
            : [],
          totalAmount: order.totalAmount,
          orderStatus: order.status || order.orderStatus || "Processing",
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        };
      });

      // Now try to populate product information
      try {
        for (let i = 0; i < formattedOrders.length; i++) {
          const orderItems = formattedOrders[i].orderItems || [];
          for (let j = 0; j < orderItems.length; j++) {
            if (orderItems[j].product) {
              const productData = await Product.findById(
                orderItems[j].product
              ).lean();
              if (productData) {
                orderItems[j].product = productData;
              }
            }
          }
        }
        console.log("Successfully populated product information");
      } catch (populateError) {
        console.error("Error populating product information:", populateError);
        // Continue with unpopulated data
      }

      console.log(
        `Successfully formatted ${formattedOrders.length} user orders`
      );
      res.json(formattedOrders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Get all orders (admin only) - IMPORTANT: This route must be defined BEFORE the /:id route
router.get(
  "/all",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }

      console.log("Fetching all orders for admin");

      // Use a simpler approach with minimal processing
      try {
        // Get orders without any population or processing
        const orders = await Order.find().lean();
        console.log(`Found ${orders.length} orders`);

        // Return the raw orders without any processing
        return res.json(orders);
      } catch (findError) {
        console.error("Error in Order.find():", findError);
        return res
          .status(500)
          .json({ message: "Database query error", error: findError.message });
      }
    } catch (error) {
      console.error("Error fetching all orders:", error);
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
        items: cart.items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
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
      console.error("Order creation error:", error);
      res.status(400).json({ message: error.message });
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
