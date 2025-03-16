const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/user");

// Check for JWT secret
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// JWT Strategy options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

console.log(
  "Initializing JWT strategy with secret:",
  process.env.JWT_SECRET ? "present" : "missing"
);

// Initialize JWT Strategy
const jwtStrategy = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    console.log("Verifying JWT payload:", payload);
    const user = await User.findById(payload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    console.error("JWT strategy error:", error);
    return done(error, false);
  }
});

// Use the JWT Strategy
passport.use("jwt", jwtStrategy);

module.exports = passport;
