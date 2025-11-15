import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const canteenId = searchParams.get('canteenId');

    let query: any = { isAvailable: true };

    if (category) {
      query.category = category;
    }

    if (canteenId) {
      query.canteenId = canteenId;
    }

    const items = await MenuItem.find(query).populate('canteenId');

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('Get menu items error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
