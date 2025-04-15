import { seedDatabase } from '@/lib/actions/database.actions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(
      { message: 'Database seeded successfully', result },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { message: 'Error seeding database', error },
      { status: 500 }
    );
  }
} 