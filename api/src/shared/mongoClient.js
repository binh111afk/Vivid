const { MongoClient } = require("mongodb");

let cachedClient;
let cachedDatabase;

function getMongoConfig() {
  const connectionString = process.env.MONGODB_URI || process.env.COSMOSDB_CONNECTION_STRING;
  const databaseName = process.env.MONGODB_DB_NAME || process.env.DB_NAME || "vivid";
  const collectionName = process.env.USERS_COLLECTION || "users";

  if (!connectionString) {
    throw new Error("Missing MongoDB connection string. Set MONGODB_URI or COSMOSDB_CONNECTION_STRING.");
  }

  return {
    connectionString,
    databaseName,
    collectionName,
  };
}

async function getUsersCollection() {
  const { connectionString, databaseName, collectionName } = getMongoConfig();

  if (!cachedClient) {
    cachedClient = new MongoClient(connectionString);
    await cachedClient.connect();
  }

  if (!cachedDatabase) {
    cachedDatabase = cachedClient.db(databaseName);
  }

  return cachedDatabase.collection(collectionName);
}

module.exports = {
  getUsersCollection,
};
