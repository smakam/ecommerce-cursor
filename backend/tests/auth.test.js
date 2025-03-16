const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const app = require("../server");
const User = require("../models/user");

let mongoServer;
let token;

beforeAll(async () => {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear users before each test
  await User.deleteMany({});
});

describe("Auth API Endpoints", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Registration successful");

      // Check if user was created in database
      const user = await User.findOne({ email: "test@example.com" });
      expect(user).toBeTruthy();
      expect(user.name).toBe("Test User");
      expect(user.email).toBe("test@example.com");
    });

    it("should not register a user with existing email", async () => {
      // First create a user
      await User.create({
        name: "Test User",
        email: "test@example.com",
        password: await bcrypt.hash("password123", 10),
      });

      // Try to register with same email
      const response = await request(app).post("/api/auth/register").send({
        name: "Another User",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("User already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await User.create({
        name: "Test User",
        email: "test@example.com",
        password: await bcrypt.hash("password123", 10),
      });
    });

    it("should login with valid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.user).toMatchObject({
        name: "Test User",
        email: "test@example.com",
      });

      token = response.body.token;
    });

    it("should not login with invalid email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "wrong@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email or password");
    });

    it("should not login with invalid password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid email or password");
    });
  });

  describe("GET /api/auth/current-user", () => {
    beforeEach(async () => {
      // Create a test user and get token
      const user = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: await bcrypt.hash("password123", 10),
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      token = response.body.token;
    });

    it("should get current user with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/current-user")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        name: "Test User",
        email: "test@example.com",
      });
    });

    it("should not get current user without token", async () => {
      const response = await request(app).get("/api/auth/current-user");

      expect(response.status).toBe(401);
    });

    it("should not get current user with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/current-user")
        .set("Authorization", "Bearer invalid_token");

      expect(response.status).toBe(401);
    });
  });
});
