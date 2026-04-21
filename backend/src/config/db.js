const mongoose = require('mongoose')

/**
 * Connects to MongoDB using the URI from environment variables.
 * Exits the process if connection fails — we never want the server
 * running without a database connection.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
