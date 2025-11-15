'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, FileText } from 'lucide-react';
import {
  Bar,
  BarChart,
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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

interface OrderLite {
  _id: string;
  totalAmount: number;
  createdAt: string;
}

interface Summary {
  orderCount: number;
  totalRevenue: number;
  totalGst: number;
  totalServiceCharge: number;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/admin/login');
    } else if (!isAdmin) {
      router.replace('/home');
    }
  }, [isAdmin, loading, router, user]);

  const [date, setDate] = useState<string>(today);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [orders, setOrders] = useState<OrderLite[]>([]);
  const [platformStats, setPlatformStats] = useState<{ totalRevenue: number; orderCount: number } | null>(null);
  const [loadingReports, setLoadingReports] = useState(false);

  const fetchReports = async () => {
    if (!isAdmin) return;
    try {
      setLoadingReports(true);
      const [dailyRes, platformRes] = await Promise.all([
        apiClient.get('/reports/daily', { params: { date } }),
        apiClient.get('/reports/platform'),
      ]);
      setSummary(dailyRes.data.summary);
      setOrders(dailyRes.data.orders || []);
      setPlatformStats(platformRes.data);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Unable to load reports', description: error.message });
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, user, isAdmin]);

  const hourlyData = useMemo(() => {
    const buckets = new Map<string, number>();
    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      const label = `${hour.toString().padStart(2, '0')}:00`;
      buckets.set(label, (buckets.get(label) || 0) + order.totalAmount);
    });
    return Array.from(buckets.entries()).map(([hour, revenue]) => ({ hour, revenue }));
  }, [orders]);

  if (loading || !user) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading reports...</div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          You do not have permission to view reports.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-headline text-3xl">Sales & reports</h1>
          <p className="text-muted-foreground">Download-ready snapshots of the canteen ecosystem for finance teams.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <Button variant="outline" className="gap-2" onClick={fetchReports} disabled={loadingReports}>
            <CalendarDays className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Orders on {date}</CardDescription>
            <CardTitle className="text-3xl">{summary?.orderCount ?? '—'}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Daily revenue</CardDescription>
            <CardTitle className="text-3xl">₹{summary ? summary.totalRevenue.toFixed(2) : '—'}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Platform revenue</CardDescription>
            <CardTitle className="text-3xl">₹{platformStats ? platformStats.totalRevenue.toFixed(2) : '—'}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total orders (platform)</CardDescription>
            <CardTitle className="text-3xl">{platformStats?.orderCount ?? '—'}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle>Hourly revenue distribution</CardTitle>
            <CardDescription>Understand peak hours for staffing decisions.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {hourlyData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="hour" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No transactions yet for the selected day.
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Key charges collected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>GST</span>
              <span>₹{summary ? summary.totalGst.toFixed(2) : '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span>Service charge</span>
              <span>₹{summary ? summary.totalServiceCharge.toFixed(2) : '0.00'}</span>
            </div>
            <Separator />
            <Button className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Export CSV (coming soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
