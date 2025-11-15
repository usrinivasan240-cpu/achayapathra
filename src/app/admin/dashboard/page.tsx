'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface DailyReport {
  totalRevenue: number;
  totalOrders: number;
  totalItems: number;
  statusCounts: {
    pending: number;
    cooking: number;
    ready: number;
    delivered: number;
    cancelled: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [report, setReport] = useState<DailyReport | null>(null);
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

    fetchDailyReport();
  }, [user, token, router]);

  const fetchDailyReport = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports/daily', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch report');

      const data = await response.json();
      setReport(data);
    } catch (error: any) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) return null;

  const chartData = report ? [
    { name: 'Pending', value: report.statusCounts.pending },
    { name: 'Cooking', value: report.statusCounts.cooking },
    { name: 'Ready', value: report.statusCounts.ready },
    { name: 'Delivered', value: report.statusCounts.delivered },
    { name: 'Cancelled', value: report.statusCounts.cancelled },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user.name}!</p>
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
              <Button variant="default" className="w-full justify-start">
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full justify-start">
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
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-600">
                        ₹{report?.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">Total Orders</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {report?.totalOrders}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">Items Sold</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {report?.totalItems}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">Avg. Order Value</p>
                      <p className="text-3xl font-bold text-orange-600">
                        ₹{report && report.totalOrders > 0 
                          ? (report.totalRevenue / report.totalOrders).toFixed(2) 
                          : '0.00'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Orders by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-yellow-50 rounded">
                      <p className="text-yellow-600 text-2xl font-bold">
                        {report?.statusCounts.pending}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>

                    <div className="text-center p-4 bg-blue-50 rounded">
                      <p className="text-blue-600 text-2xl font-bold">
                        {report?.statusCounts.cooking}
                      </p>
                      <p className="text-sm text-gray-600">Cooking</p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded">
                      <p className="text-purple-600 text-2xl font-bold">
                        {report?.statusCounts.ready}
                      </p>
                      <p className="text-sm text-gray-600">Ready</p>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded">
                      <p className="text-green-600 text-2xl font-bold">
                        {report?.statusCounts.delivered}
                      </p>
                      <p className="text-sm text-gray-600">Delivered</p>
                    </div>

                    <div className="text-center p-4 bg-red-50 rounded">
                      <p className="text-red-600 text-2xl font-bold">
                        {report?.statusCounts.cancelled}
                      </p>
                      <p className="text-sm text-gray-600">Cancelled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
