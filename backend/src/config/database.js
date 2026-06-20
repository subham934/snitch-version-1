import mongoose from 'mongoose';
import { config } from './config.js';
export async function connectDB() {
  const connection = await mongoose.connect(config.MONGO_URI);
  console.log(`MongoDB connected`);

  return connection;
}
