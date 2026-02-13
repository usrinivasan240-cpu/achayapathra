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
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    let query: any = {
      createdAt: { $gte: startDate, $lte: endDate },
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

    const statusCounts = {
      pending: orders.filter((o) => o.status === 'Pending').length,
      cooking: orders.filter((o) => o.status === 'Cooking').length,
      ready: orders.filter((o) => o.status === 'Ready').length,
      delivered: orders.filter((o) => o.status === 'Delivered').length,
      cancelled: orders.filter((o) => o.status === 'Cancelled').length,
    };

    return NextResponse.json(
      {
        date,
        totalRevenue,
        totalOrders,
        totalItems,
        statusCounts,
        orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get daily report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
