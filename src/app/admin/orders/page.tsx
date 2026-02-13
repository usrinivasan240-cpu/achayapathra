'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  tokenNumber: string;
  status: 'Pending' | 'Cooking' | 'Ready' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  items: any[];
  userId: any;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/canteen/home');
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order');

      toast.success('Order status updated');
      fetchOrders();
    } catch (error: any) {
      toast.error('Failed to update order status');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Orders</h1>
          </div>

          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 bg-white shadow-md min-h-screen p-4">
          <nav className="space-y-2">
            <Link href="/admin/dashboard">
              <Button variant="outline" className="w-full justify-start">
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="default" className="w-full justify-start">
                Orders
              </Button>
            </Link>
            <Link href="/admin/menu">
              <Button variant="outline" className="w-full justify-start">
                Menu Items
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full justify-start">
                Reports
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start">
                Settings
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No orders found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-3 text-left">Token</th>
                    <th className="border p-3 text-left">Customer</th>
                    <th className="border p-3 text-left">Items</th>
                    <th className="border p-3 text-left">Amount</th>
                    <th className="border p-3 text-left">Status</th>
                    <th className="border p-3 text-left">Time</th>
                    <th className="border p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border hover:bg-gray-50">
                      <td className="border p-3 font-mono font-bold text-orange-600">
                        {order.tokenNumber}
                      </td>
                      <td className="border p-3">
                        <div>
                          <p className="font-semibold">{order.userId?.name}</p>
                          <p className="text-sm text-gray-600">{order.userId?.phone}</p>
                        </div>
                      </td>
                      <td className="border p-3">
                        <div className="text-sm space-y-1">
                          {order.items.map((item, idx) => (
                            <p key={idx}>
                              {item.name || item.itemId} × {item.quantity}
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="border p-3 font-bold">
                        ₹{order.totalAmount.toFixed(2)}
                      </td>
                      <td className="border p-3">
                        <Select value={order.status} onValueChange={(value) => updateOrderStatus(order._id, value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Cooking">Cooking</SelectItem>
                            <SelectItem value="Ready">Ready</SelectItem>
                            <SelectItem value="Delivered">Delivered</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border p-3 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="border p-3">
                        <Link href={`/admin/orders/${order._id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
