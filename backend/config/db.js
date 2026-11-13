import mongoose from 'mongoose';

export default async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2500 });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}
