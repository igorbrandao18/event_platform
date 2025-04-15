import { connectToDatabase } from '../lib/database';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables using absolute path
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading .env.local from:', envPath);
dotenv.config({ path: envPath });

// Log the MONGODB_URI to check if it's loaded (but mask the password)
const mongoUri = process.env.MONGODB_URI || '';
console.log('MONGODB_URI loaded:', mongoUri.replace(/:([^:@]+)@/, ':****@'));

async function checkDatabase() {
  try {
    // Connect to the database
    await connectToDatabase();
    console.log('Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.collections();
    console.log('\nExisting collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.collectionName}`);
    });

    // Check specific collections we need
    const requiredCollections = ['users', 'events', 'orders', 'categories'];
    console.log('\nChecking required collections:');
    
    for (const collectionName of requiredCollections) {
      const exists = collections.some(col => col.collectionName === collectionName);
      console.log(`${collectionName}: ${exists ? '✅ exists' : '❌ missing'}`);
      
      if (!exists) {
        // Create the collection if it doesn't exist
        await mongoose.connection.db.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      }
    }

    // Check indexes
    console.log('\nChecking indexes:');
    
    // Users collection indexes
    const usersCollection = mongoose.connection.db.collection('users');
    const userIndexes = await usersCollection.indexes();
    console.log('Users indexes:', userIndexes);

    // Ensure required indexes exist
    if (!userIndexes.some(index => index.key.clerkId)) {
      await usersCollection.createIndex({ clerkId: 1 }, { unique: true });
      console.log('Created clerkId index for users collection');
    }

    if (!userIndexes.some(index => index.key.email)) {
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      console.log('Created email index for users collection');
    }

    console.log('\nDatabase check completed');
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the check
checkDatabase(); 