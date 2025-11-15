import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import { verifyToken } from '@/lib/auth/jwt';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updatedItem = await MenuItem.findByIdAndUpdate(params.id, body, {
      new: true,
    });

    if (!updatedItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Menu item updated successfully', item: updatedItem },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update menu item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const deletedItem = await MenuItem.findByIdAndDelete(params.id);

    if (!deletedItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Menu item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete menu item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
