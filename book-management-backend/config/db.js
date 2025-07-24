const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quanlymuonsach";
const client = new MongoClient(uri);

let isConnected = false;

async function connectDB() {
  try {
    if (!isConnected) {
      await client.connect();
      // Test the connection by pinging the database
      await client.db("quanlymuonsach").command({ ping: 1 });
      isConnected = true;
      console.log("MongoDB connected successfully!");
    }
    return true;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
}

// Function to get database connection status
function getConnectionStatus() {
  return isConnected;
}

// Function to close the connection
async function closeConnection() {
  try {
    await client.close();
    isConnected = false;
    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
}

module.exports = { client, connectDB, getConnectionStatus, closeConnection };
