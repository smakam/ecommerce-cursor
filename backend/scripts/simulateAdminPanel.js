const mongoose = require("mongoose");
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

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
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

// Simulate admin login and fetching users
async function simulateAdminPanel() {
  try {
    // Step 1: Simulate admin login
    console.log("Simulating admin login...");
    const adminEmail = "admin@example.com";
    const admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.error(`Admin user with email ${adminEmail} not found!`);
      return;
    }

    console.log(`Found admin user: ${admin.name} (${admin.email})`);
    console.log(`Admin status: isAdmin=${admin.isAdmin}, role=${admin.role}`);

    // Step 2: Simulate fetching all users (as admin would do)
    console.log("\nSimulating fetching all users...");

    // Method 1: Simple find
    console.log("\nMethod 1: Using User.find()");
    const usersMethod1 = await User.find({}).select("-password").lean();
    console.log(`Found ${usersMethod1.length} users using Method 1`);

    // Method 2: Using explicit query
    console.log("\nMethod 2: Using explicit query");
    const usersMethod2 = await User.find({}, { password: 0 }).lean();
    console.log(`Found ${usersMethod2.length} users using Method 2`);

    // Method 3: Using collection directly
    console.log("\nMethod 3: Using collection directly");
    const usersMethod3 = await mongoose.connection.db
      .collection("users")
      .find({})
      .toArray();
    console.log(`Found ${usersMethod3.length} users using Method 3`);

    // Print users from Method 3 (most reliable)
    if (usersMethod3.length > 0) {
      console.log("\nUsers found:");
      usersMethod3.forEach((user) => {
        console.log(
          `  ${user.name} (${user.email}) - Admin: ${user.isAdmin}, Role: ${user.role}`
        );
      });
    }

    // Check if the route handler in your code might be failing
    console.log("\nSimulating route handler logic...");
    try {
      // This is similar to what your route handler might be doing
      const adminUser = await User.findOne({ email: adminEmail });
      if (!adminUser || !adminUser.isAdmin) {
        console.log("Access denied: User is not an admin");
        return;
      }

      const allUsers = await User.find().select("-password");
      console.log(`Route handler found ${allUsers.length} users`);
    } catch (routeError) {
      console.error("Error in route handler simulation:", routeError);
    }
  } catch (error) {
    console.error("Error simulating admin panel:", error);
  } finally {
    mongoose.disconnect();
    console.log("\nDatabase connection closed");
  }
}

// Run the simulation
simulateAdminPanel();
