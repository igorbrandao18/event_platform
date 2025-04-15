import { config } from 'dotenv'
import { connectToDatabase } from '../database'
import mongoose from 'mongoose'
import { CollectionInfo } from 'mongodb'
import path from 'path'

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') })

async function testMongoDBConnection() {
  let mongooseInstance: typeof mongoose | null = null;
  
  try {
    console.log('Testing MongoDB connection...')
    console.log('Using MongoDB URI:', process.env.MONGODB_URI)
    
    // Attempt to connect to the database
    mongooseInstance = await connectToDatabase()
    
    if (!mongooseInstance?.connections[0]?.readyState) {
      throw new Error('Database connection failed')
    }
    
    console.log('✅ MongoDB connection successful!')
    console.log('Connection state:', mongooseInstance.connections[0].readyState)
    
    // Test a basic operation - get the list of collections
    const collections = await mongooseInstance.connection.db.listCollections().toArray()
    console.log('Available collections:', collections.map((col: CollectionInfo) => col.name))
    
    return true
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error instanceof Error ? error.message : 'Unknown error')
    return false
  } finally {
    // Close the connection if it was established
    if (mongooseInstance) {
      await mongooseInstance.connection.close()
      console.log('Connection closed')
    }
  }
}

// Run the test
testMongoDBConnection() 