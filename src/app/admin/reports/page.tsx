'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface MonthlyReport {
  month: number;
  year: number;
  totalRevenue: number;
  totalOrders: number;
  totalItems: number;
  dailyBreakdown: Record<string, number>;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
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

    fetchMonthlyReport();
  }, [user, token, router, month, year]);

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/monthly?month=${month}&year=${year}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch report');

      const data = await response.json();
      setReport(data);
    } catch (error: any) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const chartData = report
    ? Object.entries(report.dailyBreakdown).map(([date, revenue]) => ({
        date,
        revenue,
      }))
    : [];

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Reports</h1>
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
              <Button variant="default" className="w-full justify-start">
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
          {/* Month/Year Selection */}
          <div className="mb-6 flex gap-4">
            <Input
              type="number"
              min="1"
              max="12"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              placeholder="Month"
              className="w-20"
            />
            <Input
              type="number"
              min="2020"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              placeholder="Year"
              className="w-24"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading report...</p>
            </div>
          ) : report ? (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-600">
                        ₹{report.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">Total Orders</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {report.totalOrders}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm">Items Sold</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {report.totalItems}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              {chartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No report data available</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
