import { connectToDatabase } from '@/lib/database';
import Category from '@/lib/database/models/category.model';
import Event from '@/lib/database/models/event.model';
import User from '@/lib/database/models/user.model';
import Order from '@/lib/database/models/order.model';
import mongoose from 'mongoose';

export async function testDatabaseConnection() {
  try {
    const conn = await connectToDatabase();
    console.log('MongoDB Connection State:', mongoose.connection.readyState);
    console.log('MongoDB Connected:', conn.connection.host);
    return { success: true, message: 'Database connected successfully' };
  } catch (error) {
    console.error('Database connection error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function seedDatabase() {
  try {
    // Test connection first
    const connectionTest = await testDatabaseConnection();
    if (!connectionTest.success) {
      throw new Error(`Database connection failed: ${connectionTest.error}`);
    }

    // Create Categories
    const categories = await Category.create([
      { name: 'Conferência' },
      { name: 'Workshop' },
      { name: 'Meetup' }
    ]);
    console.log('Categories created:', categories);

    // Create a test user
    const user = await User.create({
      clerkId: 'test_clerk_id',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      photo: 'https://example.com/photo.jpg'
    });
    console.log('User created:', user);

    // Create an event
    const event = await Event.create({
      title: 'Evento Teste',
      description: 'Descrição do evento teste',
      location: 'São Paulo, SP',
      createdAt: new Date(),
      imageUrl: 'https://example.com/event.jpg',
      startDateTime: new Date(),
      endDateTime: new Date(Date.now() + 86400000), // +1 day
      price: '100',
      isFree: false,
      url: 'https://example.com/event',
      category: categories[0]._id,
      organizer: user._id
    });
    console.log('Event created:', event);

    return { 
      success: true,
      message: 'Database seeded successfully',
      data: { categories, user, event }
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getAllCollectionsData() {
  try {
    // Test connection first
    const connectionTest = await testDatabaseConnection();
    if (!connectionTest.success) {
      throw new Error(`Database connection failed: ${connectionTest.error}`);
    }

    // Get all categories
    const categories = await Category.find({});
    console.log('Categories:', JSON.stringify(categories, null, 2));

    // Get all events with populated references
    const events = await Event.find({})
      .populate('category')
      .populate('organizer');
    console.log('Events:', JSON.stringify(events, null, 2));

    // Get all users
    const users = await User.find({});
    console.log('Users:', JSON.stringify(users, null, 2));

    // Get all orders with populated references
    const orders = await Order.find({})
      .populate('eventId')
      .populate('buyerId');
    console.log('Orders:', JSON.stringify(orders, null, 2));

    return {
      success: true,
      data: {
        categories,
        events,
        users,
        orders
      }
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 