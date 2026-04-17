const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

let cachedConnection = null;

async function ensureDefaultAdminAccount() {
  const username = "admin";
  const existingAdmin = await User.findOne({ username });

  const hashedPassword = await bcrypt.hash("123456", 12);

  if (existingAdmin) {
    const canUseDefaultPassword = await bcrypt.compare("123456", existingAdmin.password);

    if (canUseDefaultPassword) {
      return;
    }

    existingAdmin.password = hashedPassword;
    if (!existingAdmin.displayName) {
      existingAdmin.displayName = "Administrator";
    }
    if (typeof existingAdmin.avatar !== "string") {
      existingAdmin.avatar = "";
    }
    await existingAdmin.save();
    console.log("[DB] Reset admin password to default: admin / 123456");
    return;
  }

  await User.create({
    username,
    password: hashedPassword,
    displayName: "Administrator",
    avatar: "",
  });

  console.log("[DB] Created default admin account: admin / 123456");
}

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const connectionString = process.env.COSMOSDB_CONNECTION_STRING;

  if (!connectionString) {
    throw new Error("Missing COSMOSDB_CONNECTION_STRING environment variable.");
  }

  if (mongoose.connection.readyState === 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  console.log("[DB] Connecting to Cosmos DB with mongoose...");

  try {
    await mongoose.connect(connectionString, {
      dbName: process.env.COSMOSDB_DATABASE || "vivid",
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 15000,
    });
  } catch (err) {
    console.error("[DB] CosmosDB Connection Error details:", err);
    throw err;
  }

  console.log("[DB] Connected to Cosmos DB successfully.");

  await ensureDefaultAdminAccount();

  cachedConnection = mongoose.connection;
  return cachedConnection;
}

module.exports = connectToDatabase;
