const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const app = require("../server");
const Order = require("../models/order");
const Cart = require("../models/cart");
const User = require("../models/user");
const Product = require("../models/product");

let mongoServer;
let token;
let testUser;
let testProduct;
let testCart;
let testOrder;

beforeAll(async () => {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create a test user
  const hashedPassword = await bcrypt.hash("password123", 10);
  testUser = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: hashedPassword,
  });

  // Get JWT token
  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "test@example.com",
    password: "password123",
  });

  token = loginResponse.body.token;

  // Create a test product
  testProduct = await Product.create({
    name: "Test Product",
    price: 99.99,
    description: "Test Description",
    stock: 10,
    imageUrl: "https://example.com/test.jpg",
    category: "Test Category",
    images: ["https://example.com/test1.jpg", "https://example.com/test2.jpg"],
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear orders and cart before each test
  await Order.deleteMany({});
  await Cart.deleteMany({});

  // Create a test cart with items
  testCart = await Cart.create({
    user: testUser._id,
    items: [
      {
        product: testProduct._id,
        quantity: 2,
        price: testProduct.price,
      },
    ],
  });

  // Create a test order
  testOrder = await Order.create({
    user: testUser._id,
    items: [
      {
        product: testProduct._id,
        quantity: 2,
        price: testProduct.price,
      },
    ],
    totalAmount: testProduct.price * 2,
    shippingAddress: {
      street: "123 Test St",
      city: "Test City",
      state: "Test State",
      zipCode: "12345",
      country: "Test Country",
    },
    paymentMethod: "razorpay",
    razorpayOrderId: "order_test123",
    status: "pending",
  });
});

describe("Order API Endpoints", () => {
  describe("GET /api/orders", () => {
    it("should get user's orders", async () => {
      const response = await request(app)
        .get("/api/orders")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].totalAmount).toBe(199.98);
    });

    it("should not get orders without authentication", async () => {
      const response = await request(app).get("/api/orders");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should get a single order", async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.totalAmount).toBe(199.98);
      expect(response.body.status).toBe("pending");
    });

    it("should not get another user's order", async () => {
      // Create another user and their order
      const otherUser = await User.create({
        name: "Other User",
        email: "other@example.com",
        password: await bcrypt.hash("password123", 10),
      });

      const otherOrder = await Order.create({
        user: otherUser._id,
        items: [
          {
            product: testProduct._id,
            quantity: 1,
            price: testProduct.price,
          },
        ],
        totalAmount: testProduct.price,
        shippingAddress: {
          street: "456 Other St",
          city: "Other City",
          state: "Other State",
          zipCode: "67890",
          country: "Other Country",
        },
        paymentMethod: "razorpay",
        razorpayOrderId: "order_other123",
        status: "pending",
      });

      const response = await request(app)
        .get(`/api/orders/${otherOrder._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Order not found");
    });

    it("should return 404 for non-existent order", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/orders/${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Order not found");
    });
  });

  describe("POST /api/orders", () => {
    it("should create an order from cart", async () => {
      const orderData = {
        shippingAddress: {
          street: "789 New St",
          city: "New City",
          state: "New State",
          zipCode: "13579",
          country: "New Country",
        },
        paymentMethod: "razorpay",
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.order.status).toBe("pending");
      expect(response.body.order.items).toHaveLength(1);
      expect(response.body.razorpayOrder).toBeTruthy();
      expect(response.body.razorpayOrder.currency).toBe("INR");

      // Check if cart was cleared
      const cart = await Cart.findOne({ user: testUser._id });
      expect(cart.items).toHaveLength(0);
    });

    it("should not create order with empty cart", async () => {
      // Clear the cart
      await Cart.findOneAndUpdate(
        { user: testUser._id },
        { items: [] },
        { new: true }
      );

      const orderData = {
        shippingAddress: {
          street: "789 New St",
          city: "New City",
          state: "New State",
          zipCode: "13579",
          country: "New Country",
        },
        paymentMethod: "razorpay",
      };

      const response = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cart is empty");
    });
  });

  describe("POST /api/orders/:id/verify-payment", () => {
    it("should verify payment and update order status", async () => {
      // Create a valid signature
      const hmac = crypto.createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET || "test_secret"
      );
      hmac.update(testOrder.razorpayOrderId + "|" + "pay_test123");
      const validSignature = hmac.digest("hex");

      const paymentData = {
        razorpayPaymentId: "pay_test123",
        razorpaySignature: validSignature,
      };

      const response = await request(app)
        .post(`/api/orders/${testOrder._id}/verify-payment`)
        .set("Authorization", `Bearer ${token}`)
        .send(paymentData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Payment verified successfully");

      // Check if order status was updated
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder.status).toBe("paid");
      expect(updatedOrder.paymentDetails.paymentId).toBe("pay_test123");
    });

    it("should not verify payment for non-existent order", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const paymentData = {
        razorpayPaymentId: "pay_test123",
        razorpaySignature: "valid_signature",
      };

      const response = await request(app)
        .post(`/api/orders/${nonExistentId}/verify-payment`)
        .set("Authorization", `Bearer ${token}`)
        .send(paymentData);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Order not found");
    });

    it("should not verify payment with invalid signature", async () => {
      const paymentData = {
        razorpayPaymentId: "pay_test123",
        razorpaySignature: "invalid_signature",
      };

      const response = await request(app)
        .post(`/api/orders/${testOrder._id}/verify-payment`)
        .set("Authorization", `Bearer ${token}`)
        .send(paymentData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid payment signature");
    });
  });
});
