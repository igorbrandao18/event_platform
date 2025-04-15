import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose || { conn: null, promise: null };

export const connectToDatabase = async () => {
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  if(!MONGODB_URI) {
    console.error('MONGODB_URI is missing');
    throw new Error('MONGODB_URI is missing');
  }

  try {
    console.log('Connecting to MongoDB...');
    
    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        dbName: 'evently',
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts);
      console.log('Created new connection promise');
    }

    cached.conn = await cached.promise;
    console.log('Successfully connected to MongoDB');

    // Ensure we have a connection before proceeding
    if (!mongoose.connection.readyState) {
      throw new Error('MongoDB connection is not ready');
    }

    return cached.conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}