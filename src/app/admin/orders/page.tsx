'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { AppShell } from '@/components/canteen/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

const orderStatuses = ['Pending', 'Cooking', 'Ready', 'Delivered', 'Cancelled', 'Rejected'];

interface AdminOrderItem {
  _id: string;
  tokenNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  createdAt: string;
}

export default function AdminOrdersPage() {
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

  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const fetchOrders = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setIsLoading(true);
      const response = await apiClient.get('/orders', {
        params: statusFilter === 'All' ? {} : { status: statusFilter },
      });
      setOrders(response.data.orders || []);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Unable to fetch orders', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, statusFilter, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingId(orderId);
      const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status: response.data.order.status } : order)));
      toast({ title: 'Order updated', description: `Status changed to ${status}.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: error?.response?.data?.message || error.message });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading || !user) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading orders...</div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          You do not have permission to view orders.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl">Orders board</h1>
          <p className="text-muted-foreground">Switch stages, reject orders and keep students updated instantly.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {orderStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchOrders} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id} className="border-muted/60">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl">
                  Token {order.tokenNumber}
                  <Badge variant="secondary">₹{order.totalAmount.toFixed(2)}</Badge>
                </CardTitle>
                <CardDescription>
                  {order.user?.name} • {order.user?.email}
                  {order.user?.phone ? ` • ${order.user.phone}` : ''}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={order.status} onValueChange={(value) => updateStatus(order._id, value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={`${order._id}-${status}`} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {updatingId === order._id && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {order.items.map((item, index) => (
                  <div key={`${order._id}-${index}`} className="rounded-lg border border-border/60 bg-card/60 p-3">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.qty}</p>
                    <p className="text-xs text-muted-foreground">₹{(item.price * item.qty).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Created {new Date(order.createdAt).toLocaleString()} • Payment {order.paymentStatus}
              </p>
            </CardContent>
          </Card>
        ))}

        {!orders.length && !isLoading && (
          <Card className="border-dashed border-muted-foreground/40">
            <CardContent className="flex min-h-[200px] items-center justify-center text-muted-foreground">
              No orders to display.
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
