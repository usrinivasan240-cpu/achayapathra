import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      price,
      description,
      category,
      isVeg,
      ingredients,
      image,
      canteenId,
    } = body;

    if (!name || !price || !category || !canteenId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const menuItem = await MenuItem.create({
      name,
      price,
      description,
      category,
      isVeg,
      ingredients,
      image,
      canteenId,
    });

    return NextResponse.json(
      { message: 'Menu item added successfully', item: menuItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add menu item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
