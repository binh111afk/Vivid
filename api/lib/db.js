const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

let cachedConnection = null;

async function ensureLocalDefaultAdmin() {
  const isProduction = (process.env.NODE_ENV || "").toLowerCase() === "production";
  const forceEnable = (process.env.ENABLE_LOCAL_DEFAULT_ADMIN || "").toLowerCase() === "true";

  if (isProduction && !forceEnable) {
    return;
  }

  const username = "admin";
  const existingAdmin = await User.findOne({ username }).lean();

  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash("123456", 12);

  await User.create({
    username,
    password: hashedPassword,
    displayName: "Administrator",
    avatar: "",
  });

  console.log("[DB] Created local default admin account: admin / 123456");
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

  await mongoose.connect(connectionString, {
    dbName: process.env.COSMOSDB_DATABASE || "vivid",
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 15000,
  });

  console.log("[DB] Connected to Cosmos DB successfully.");

  await ensureLocalDefaultAdmin();

  cachedConnection = mongoose.connection;
  return cachedConnection;
}

module.exports = connectToDatabase;
