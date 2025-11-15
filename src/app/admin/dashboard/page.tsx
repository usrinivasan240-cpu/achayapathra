'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, IndianRupee, Pizza } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import apiClient from '@/lib/api-client';
import { AppShell } from '@/components/canteen/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

interface DailySummary {
  orderCount: number;
  totalRevenue: number;
  totalGst: number;
  totalServiceCharge: number;
}

interface OrderLite {
  _id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  tokenNumber: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/admin/login');
    } else if (!isAdmin) {
      router.replace('/home');
    }
  }, [isAdmin, loading, router, user]);

  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoadingDashboard(true);
      const [dailyRes, ordersRes] = await Promise.all([
        apiClient.get('/reports/daily', { params: { canteen: user?.canteen } }),
        apiClient.get('/orders', { params: { limit: 10 } }),
      ]);
      setSummary(dailyRes.data.summary);
      setOrders(ordersRes.data.orders || []);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Unable to load dashboard', description: error.message });
    } finally {
      setLoadingDashboard(false);
    }
  }, [isAdmin, toast, user?.canteen]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchDashboard();
  }, [user, isAdmin, fetchDashboard]);

  const chartData = useMemo(() => {
    if (!orders.length) {
      return [];
    }
    const grouped = orders.reduce<Record<string, { token: string; revenue: number }>>((acc, order) => {
      const key = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (!acc[key]) {
        acc[key] = { token: order.tokenNumber, revenue: 0 };
      }
      acc[key].revenue += order.totalAmount;
      return acc;
    }, {});

    return Object.entries(grouped).map(([time, value]) => ({ time, revenue: value.revenue }));
  }, [orders]);

  if (loading || !user) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading dashboard...</div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          You do not have permission to view this dashboard.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl">Canteen dashboard</h1>
          <p className="text-muted-foreground">Monitor token flow, revenue stats and kitchen throughput in real-time.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={fetchDashboard} disabled={loadingDashboard}>
          Refresh
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <CardDescription>Today&apos;s revenue</CardDescription>
            <CardTitle className="flex items-baseline gap-2 text-3xl">
              <IndianRupee className="h-6 w-6 text-primary" />
              {summary ? summary.totalRevenue.toFixed(2) : '—'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Orders processed</CardDescription>
            <CardTitle className="flex items-baseline gap-2 text-3xl">
              <Pizza className="h-6 w-6 text-primary" />
              {summary ? summary.orderCount : '—'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>GST collected</CardDescription>
            <CardTitle className="text-3xl">₹{summary ? summary.totalGst.toFixed(2) : '—'}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Service fees</CardDescription>
            <CardTitle className="text-3xl">₹{summary ? summary.totalServiceCharge.toFixed(2) : '—'}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle>Revenue curve</CardTitle>
            <CardDescription>Last 10 orders revenue trend</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#f97316" fillOpacity={1} fill="url(#revenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Not enough data for chart. Orders will appear here in real-time.
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle>Latest tokens</CardTitle>
            <CardDescription>Kitchen queue snapshot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {orders.length === 0 ? (
              <p className="text-muted-foreground">No orders yet today.</p>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 p-3">
                  <div>
                    <p className="font-semibold">Token {order.tokenNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Badge variant="secondary">₹{order.totalAmount.toFixed(2)}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
