import mongoose from 'mongoose';

let cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  const MONGODB_URI = process.env.MONGODB_URI;
  console.log('Checking MONGODB_URI in connectToDatabase:', MONGODB_URI);

  if(!MONGODB_URI) throw new Error('MONGODB_URI is missing');

  try {
    cached.promise = cached.promise || mongoose.connect(MONGODB_URI, {
      dbName: 'evently',
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000
    });

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}