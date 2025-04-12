const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Connection strings
const LOCAL_MONGODB_URI =
  "mongodb://admin:password123@localhost:27017/ecommerce?authSource=admin";

// Load environment variables for Atlas connection
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
const envPath = path.join(__dirname, "..", envFile);
console.log("Loading environment from:", envPath);
dotenv.config({ path: envPath });

const ATLAS_MONGODB_URI = process.env.MONGODB_URI;
console.log("Atlas URI:", ATLAS_MONGODB_URI);

// Create connections to both databases
const localConnection = mongoose.createConnection(LOCAL_MONGODB_URI);
const atlasConnection = mongoose.createConnection(ATLAS_MONGODB_URI);

// Define schema for both connections
const userSchema = new mongoose.Schema({}, { strict: false });

// Create models for both connections
const LocalUser = localConnection.model("User", userSchema);
const AtlasUser = atlasConnection.model("User", userSchema);

// Compare users in both databases
async function compareUsers() {
  try {
    console.log("Connected to both databases");

    // Get users from local database
    console.log("\n--- LOCAL DATABASE USERS ---");
    const localUsers = await LocalUser.find({}).lean();
    console.log(`Found ${localUsers.length} users in local database:`);

    if (localUsers.length > 0) {
      localUsers.forEach((user) => {
        console.log(
          `  ${user.name} (${user.email}) - Admin: ${user.isAdmin}, Role: ${user.role}`
        );
        console.log(`  ID: ${user._id}`);
        console.log(
          `  Password hash length: ${
            user.password ? user.password.length : "N/A"
          }`
        );
        console.log(`  ---`);
      });
    } else {
      console.log("No users found in local database");
    }

    // Get users from Atlas database
    console.log("\n--- ATLAS DATABASE USERS ---");
    const atlasUsers = await AtlasUser.find({}).lean();
    console.log(`Found ${atlasUsers.length} users in Atlas database:`);

    if (atlasUsers.length > 0) {
      atlasUsers.forEach((user) => {
        console.log(
          `  ${user.name} (${user.email}) - Admin: ${user.isAdmin}, Role: ${user.role}`
        );
        console.log(`  ID: ${user._id}`);
        console.log(
          `  Password hash length: ${
            user.password ? user.password.length : "N/A"
          }`
        );
        console.log(`  ---`);
      });
    } else {
      console.log("No users found in Atlas database");
    }

    // Check Atlas database collections
    console.log("\n--- ATLAS DATABASE COLLECTIONS ---");
    const collections = await atlasConnection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in Atlas database:`);
    collections.forEach((collection) => {
      console.log(`  ${collection.name}`);
    });

    // Check if users collection exists and has documents
    if (collections.some((c) => c.name === "users")) {
      const count = await atlasConnection.db
        .collection("users")
        .countDocuments();
      console.log(`  'users' collection has ${count} documents`);
    }
  } catch (error) {
    console.error("Error comparing users:", error);
  } finally {
    // Close connections
    await localConnection.close();
    await atlasConnection.close();
    console.log("\nDatabase connections closed");
  }
}

// Run the comparison function
compareUsers();
