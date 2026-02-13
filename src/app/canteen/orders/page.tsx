'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  tokenNumber: string;
  status: 'Pending' | 'Cooking' | 'Ready' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  items: any[];
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, [user, token, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch orders');

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error: any) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusProgress = (status: string): number => {
    const statusMap = {
      Pending: 25,
      Cooking: 50,
      Ready: 75,
      Delivered: 100,
      Cancelled: 0,
    };
    return statusMap[status as keyof typeof statusMap] || 0;
  };

  const getStatusColor = (status: string): string => {
    const colorMap = {
      Pending: 'text-yellow-600',
      Cooking: 'text-blue-600',
      Ready: 'text-green-600',
      Delivered: 'text-green-700',
      Cancelled: 'text-red-600',
    };
    return colorMap[status as keyof typeof colorMap] || 'text-gray-600';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <Link href="/canteen/home" className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-orange-600">Order Tracking</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 text-lg mb-4">You haven't placed any orders yet</p>
              <Link href="/canteen/home">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Start Ordering
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-mono font-bold">
                          {order.tokenNumber}
                        </span>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </p>
                      <p className="text-sm text-gray-600">₹{order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Items */}
                  <div>
                    <h4 className="font-semibold mb-2">Items</h4>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-gray-600">
                          {item.name || item.itemId} × {item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Status Progress */}
                  <div>
                    <h4 className="font-semibold mb-2">Order Status</h4>
                    <Progress
                      value={getStatusProgress(order.status)}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>Pending</span>
                      <span>Cooking</span>
                      <span>Ready</span>
                      <span>Delivered</span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="grid grid-cols-4 gap-2 pt-4">
                    {['Pending', 'Cooking', 'Ready', 'Delivered'].map((status) => (
                      <div
                        key={status}
                        className={`text-center p-2 rounded ${
                          ['Pending', 'Cooking', 'Ready', 'Delivered']
                            .slice(0, ['Pending', 'Cooking', 'Ready', 'Delivered'].indexOf(status) + 1)
                            .includes(order.status)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <p className="text-xs font-semibold">{status}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
