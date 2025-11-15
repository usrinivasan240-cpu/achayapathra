import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/lib/models/Order';
import { verifyToken } from '@/lib/auth/jwt';

function generateTokenNumber(): string {
  const prefix = 'TN';
  const number = Math.floor(Math.random() * 900) + 100;
  return `${prefix}${number}`;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const {
      items,
      subtotal,
      gst,
      serviceCharge,
      discount,
      totalAmount,
      canteenId,
      couponCode,
      notes,
    } = body;

    if (!items || !canteenId || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tokenNumber = generateTokenNumber();

    const order = await Order.create({
      userId: payload.userId,
      items,
      subtotal,
      gst,
      serviceCharge,
      discount: discount || 0,
      totalAmount,
      tokenNumber,
      canteenId,
      couponCode,
      paymentStatus: 'Paid',
      notes,
    });

    return NextResponse.json(
      {
        message: 'Order created successfully',
        order: {
          id: order._id,
          tokenNumber: order.tokenNumber,
          status: order.status,
          totalAmount: order.totalAmount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const canteenId = searchParams.get('canteenId');

    let query: any = {};

    if (payload.role === 'user') {
      query.userId = payload.userId;
    } else if (payload.role === 'admin' && canteenId) {
      query.canteenId = canteenId;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .populate('items.itemId', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
