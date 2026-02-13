import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Coupon from '@/lib/models/Coupon';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { code, totalAmount } = body;

    if (!code || !totalAmount) {
      return NextResponse.json(
        { error: 'Code and total amount are required' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiryDate: { $gt: new Date() },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 404 });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (totalAmount * coupon.discount) / 100;
    } else {
      discount = coupon.discount;
    }

    const finalAmount = Math.max(0, totalAmount - discount);

    return NextResponse.json(
      {
        discount,
        finalAmount,
        discountType: coupon.discountType,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
