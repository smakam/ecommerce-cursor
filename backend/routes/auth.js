const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email });
    await User.register(user, password);
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login route
router.post("/login", passport.authenticate("local"), (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  res.json({ token, user: req.user });
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
    res.json(req.user);
  }
);

module.exports = router;
