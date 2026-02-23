import mongoose from 'mongoose';
import 'dotenv/config';

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const url = process.env.MONGODB_URI;
      
      if (!url) {
        throw new Error("MONGODB_URI is not defined in .env file");
      }

      this.connection = await mongoose.connect(url);
      console.log("MongoDB connected successfully");
      return this.connection;
    } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      console.log("MongoDB disconnected");
    }
  }

  getConnection() {
    return this.connection;
  }
}

export default new Database();
