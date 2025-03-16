const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    // Find user
    const user = await User.findOne({ email });
    console.log("User found:", !!user);
    console.log("User details:", {
      id: user?._id,
      name: user?.name,
      email: user?.email,
      isAdmin: user?.isAdmin,
      role: user?.role,
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isValidPassword);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    console.log(
      "Generating JWT with secret:",
      process.env.JWT_SECRET ? "present" : "missing"
    );
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Google OAuth login route
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    console.log("Google login attempt with credential");

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    console.log("Google auth payload:", { email, name });

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user if they don't exist
      console.log("Creating new user from Google login");
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = new User({
        name,
        email,
        password: hashedPassword,
        profilePicture: picture,
      });

      await user.save();
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout();
  res.json({ message: "Logged out successfully" });
});

// Get current user
router.get(
  "/current-user",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log("Current user details:", {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
      role: req.user.role,
    });

    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
      role: req.user.role,
    });
  }
);

// Get all users (admin only)
router.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const users = await User.find().select("-password");
      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
