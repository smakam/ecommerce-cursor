const mongoose = require("mongoose");
const crypto = require("crypto");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables for Atlas connection
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
const envPath = path.join(__dirname, "..", envFile);
console.log("Loading environment from:", envPath);
dotenv.config({ path: envPath });

// Helper function to hash password using crypto
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
};

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Define User schema
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    isAdmin: Boolean,
    role: String,
  },
  { strict: false }
);

const User = mongoose.model("User", userSchema);

// Update user passwords
async function updatePasswords() {
  try {
    // Get all users
    const users = await User.find({}).lean();
    console.log(`Found ${users.length} users to update`);

    // Define known passwords for specific users
    const knownPasswords = {
      "admin@example.com": "admin123",
      "seller@example.com": "seller123",
      "customer@example.com": "customer123",
      "sreemakam@gmail.com": "password123", // Assuming a default password
    };

    // Update each user's password
    for (const user of users) {
      const email = user.email;
      const password = knownPasswords[email];

      if (password) {
        const hashedPassword = hashPassword(password);
        await User.updateOne({ _id: user._id }, { password: hashedPassword });
        console.log(`Updated password for ${email}`);
      } else {
        console.log(`No known password for ${email}, skipping`);
      }
    }

    console.log("Password update completed successfully!");
  } catch (error) {
    console.error("Error updating passwords:", error);
  } finally {
    mongoose.disconnect();
    console.log("Database connection closed");
  }
}

// Run the update function
updatePasswords();
