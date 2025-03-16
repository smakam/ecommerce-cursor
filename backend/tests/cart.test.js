const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const app = require("../server"); // Make sure to export app from server.js
const Cart = require("../models/cart");
const User = require("../models/user");
const Product = require("../models/product");

let mongoServer;
let token;
let testUser;
let testProduct;

beforeAll(async () => {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create a test user with hashed password
  const hashedPassword = await bcrypt.hash("password123", 10);
  testUser = await User.create({
    email: "test@example.com",
    password: hashedPassword,
    name: "Test User",
  });

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

  // Get JWT token
  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "test@example.com",
    password: "password123",
  });

  token = loginResponse.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the cart before each test
  await Cart.deleteMany({});
});

describe("Cart API Endpoints", () => {
  describe("GET /api/cart", () => {
    it("should get empty cart for new user", async () => {
      const response = await request(app)
        .get("/api/cart")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.cart.items).toHaveLength(0);
    });
  });

  describe("POST /api/cart/add", () => {
    it("should add item to cart", async () => {
      const response = await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.items[0].quantity).toBe(2);
      expect(response.body.cart.items[0].product._id.toString()).toBe(
        testProduct._id.toString()
      );
    });

    it("should update quantity if product already in cart", async () => {
      // First add an item
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 2,
        });

      // Then add the same item again
      const response = await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.cart.items).toHaveLength(1);
      expect(response.body.cart.items[0].quantity).toBe(3);
    });
  });

  describe("PUT /api/cart/update/:productId", () => {
    it("should update item quantity", async () => {
      // First add an item
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 2,
        });

      // Then update its quantity
      const response = await request(app)
        .put(`/api/cart/update/${testProduct._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          quantity: 5,
        });

      expect(response.status).toBe(200);
      expect(response.body.cart.items[0].quantity).toBe(5);
    });

    it("should remove item when quantity is 0", async () => {
      // First add an item
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 2,
        });

      // Then set its quantity to 0
      const response = await request(app)
        .put(`/api/cart/update/${testProduct._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          quantity: 0,
        });

      expect(response.status).toBe(200);
      expect(response.body.cart.items).toHaveLength(0);
    });
  });

  describe("DELETE /api/cart/remove/:productId", () => {
    it("should remove item from cart", async () => {
      // First add an item
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 2,
        });

      const response = await request(app)
        .delete(`/api/cart/remove/${testProduct._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.cart.items).toHaveLength(0);
    });
  });

  describe("DELETE /api/cart/clear", () => {
    it("should clear the cart", async () => {
      // First add some items
      await request(app)
        .post("/api/cart/add")
        .set("Authorization", `Bearer ${token}`)
        .send({
          productId: testProduct._id.toString(),
          quantity: 2,
        });

      const response = await request(app)
        .delete("/api/cart/clear")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.cart.items).toHaveLength(0);
    });
  });
});
