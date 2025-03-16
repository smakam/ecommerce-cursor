const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to hash password using crypto
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
};

// Helper function to verify password
const verifyPassword = (password, hashedPassword) => {
  const [salt, storedHash] = hashedPassword.split(":");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return storedHash === hash;
};

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user with crypto hash
    const hashedPassword = hashPassword(password);
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

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password using crypto
    const isPasswordValid = verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
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
      const hashedPassword = hashPassword(randomPassword);

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
        return res.status(403).json({ message: "Access denied" });
      }

      const users = await User.find().select("-password");
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
