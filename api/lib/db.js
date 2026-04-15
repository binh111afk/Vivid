const mongoose = require("mongoose");

let cachedConnection = null;

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

  cachedConnection = mongoose.connection;
  return cachedConnection;
}

module.exports = connectToDatabase;
