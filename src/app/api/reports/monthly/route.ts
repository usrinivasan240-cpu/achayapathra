import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/lib/models/Order';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const canteenId = searchParams.get('canteenId');
    const month = searchParams.get('month') || new Date().getMonth() + 1;
    const year = searchParams.get('year') || new Date().getFullYear();

    const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    let query: any = {
      createdAt: { $gte: startDate, $lt: endDate },
      paymentStatus: 'Paid',
    };

    if (canteenId) {
      query.canteenId = canteenId;
    }

    const orders = await Order.find(query);

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const totalItems = orders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
    }, 0);

    const dailyBreakdown: { [key: string]: number } = {};
    orders.forEach((order) => {
      const day = order.createdAt.toISOString().split('T')[0];
      dailyBreakdown[day] = (dailyBreakdown[day] || 0) + order.totalAmount;
    });

    return NextResponse.json(
      {
        month,
        year,
        totalRevenue,
        totalOrders,
        totalItems,
        dailyBreakdown,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get monthly report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
