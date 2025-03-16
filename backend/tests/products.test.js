const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const app = require("../server");
const Product = require("../models/product");
const User = require("../models/user");

let mongoServer;
let token;
let adminToken;
let testProduct;

beforeAll(async () => {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create a regular user
  const hashedPassword = await bcrypt.hash("password123", 10);
  await User.create({
    name: "Test User",
    email: "test@example.com",
    password: hashedPassword,
    isAdmin: false,
  });

  // Create an admin user
  await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: hashedPassword,
    isAdmin: true,
  });

  // Get tokens for both users
  const userResponse = await request(app).post("/api/auth/login").send({
    email: "test@example.com",
    password: "password123",
  });
  token = userResponse.body.token;

  const adminResponse = await request(app).post("/api/auth/login").send({
    email: "admin@example.com",
    password: "password123",
  });
  adminToken = adminResponse.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear products before each test
  await Product.deleteMany({});

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

describe("Product API Endpoints", () => {
  describe("GET /api/products", () => {
    it("should get all products", async () => {
      const response = await request(app).get("/api/products");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe("Test Product");
    });
  });

  describe("GET /api/products/:id", () => {
    it("should get a single product", async () => {
      const response = await request(app).get(
        `/api/products/${testProduct._id}`
      );

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Test Product");
      expect(response.body.price).toBe(99.99);
    });

    it("should return 404 for non-existent product", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/products/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Product not found");
    });
  });

  describe("POST /api/products", () => {
    const newProduct = {
      name: "New Product",
      price: 149.99,
      description: "New Description",
      stock: 20,
      imageUrl: "https://example.com/new.jpg",
      category: "New Category",
      images: ["https://example.com/new1.jpg", "https://example.com/new2.jpg"],
    };

    it("should create a product when admin", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe("New Product");
      expect(response.body.price).toBe(149.99);
    });

    it("should not create a product when not admin", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(newProduct);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Not authorized");
    });

    it("should not create a product without authentication", async () => {
      const response = await request(app)
        .post("/api/products")
        .send(newProduct);

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/products/:id", () => {
    const updatedProduct = {
      name: "Updated Product",
      price: 199.99,
    };

    it("should update a product when admin", async () => {
      const response = await request(app)
        .put(`/api/products/${testProduct._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updatedProduct);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Updated Product");
      expect(response.body.price).toBe(199.99);
      // Original fields should remain unchanged
      expect(response.body.description).toBe("Test Description");
    });

    it("should not update a product when not admin", async () => {
      const response = await request(app)
        .put(`/api/products/${testProduct._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updatedProduct);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Not authorized");
    });

    it("should not update a non-existent product", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/products/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updatedProduct);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Product not found");
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should delete a product when admin", async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Product deleted");

      // Verify product was deleted
      const deletedProduct = await Product.findById(testProduct._id);
      expect(deletedProduct).toBeNull();
    });

    it("should not delete a product when not admin", async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Not authorized");
    });

    it("should not delete a non-existent product", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/products/${nonExistentId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Product not found");
    });
  });
});
