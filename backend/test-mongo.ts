import mongoose from 'mongoose';

const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lucidgrowth";

async function run() {
  try {
    console.log("Connecting to MongoDB:", uri);
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

run();
