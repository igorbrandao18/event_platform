import { testDatabaseConnection } from '@/lib/actions/database.actions';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await testDatabaseConnection();
  return NextResponse.json(result);
} 