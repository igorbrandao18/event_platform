import { getAllCollectionsData } from '@/lib/actions/database.actions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await getAllCollectionsData();
    return NextResponse.json(
      { message: 'Data fetched successfully', data },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching data', error },
      { status: 500 }
    );
  }
} 