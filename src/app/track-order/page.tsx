'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock3, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { getSocket, initializeSocket, joinRoom } from '@/lib/socket';
import { AppShell } from '@/components/canteen/layout/app-shell';
import { OrderStatusProgress, OrderStatus } from '@/components/canteen/orders/order-status-progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

interface OrderResponse {
  _id: string;
  tokenNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  totalAmount: number;
  timeline: {
    pendingAt?: string;
    cookingAt?: string;
    readyAt?: string;
    deliveredAt?: string;
  };
}

export default function TrackOrderPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [activeOrder, setActiveOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActiveOrder = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await apiClient.get('/orders/my');
      const orders: OrderResponse[] = response.data.orders || [];
      const ongoing = orders.find((order) => !['Delivered', 'Cancelled', 'Rejected'].includes(order.status));
      setActiveOrder(ongoing || orders[0] || null);
      if (ongoing) {
        initializeSocket({ userId: user.id, orderId: ongoing._id });
        joinRoom(`order:${ongoing._id}`);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Unable to fetch orders', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    fetchActiveOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  useEffect(() => {
    if (!activeOrder) return;

    let socket = getSocket();
    if (!socket) {
      socket = initializeSocket({ userId: user?.id, orderId: activeOrder._id }) ?? null;
    }

    joinRoom(`order:${activeOrder._id}`);

    socket?.on('order:update', (order: OrderResponse) => {
      if (order._id === activeOrder._id) {
        setActiveOrder(order);
      }
    });

    return () => {
      socket?.off('order:update');
    };
  }, [activeOrder, user?.id]);

  const formattedTimeline = useMemo(() => {
    if (!activeOrder) return [];
    return [
      { label: 'Pending', timestamp: activeOrder.timeline.pendingAt },
      { label: 'Cooking', timestamp: activeOrder.timeline.cookingAt },
      { label: 'Ready', timestamp: activeOrder.timeline.readyAt },
      { label: 'Delivered', timestamp: activeOrder.timeline.deliveredAt },
    ];
  }, [activeOrder]);

  if (loading || !user) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading live order status...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl">Track your order</h1>
          <p className="text-muted-foreground">Live updates from kitchen to counter with socket powered refreshes.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={fetchActiveOrder} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {activeOrder ? (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Clock3 className="h-6 w-6 text-primary" /> Token {activeOrder.tokenNumber}
            </CardTitle>
            <CardDescription>Payment status: {activeOrder.paymentStatus}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <OrderStatusProgress status={activeOrder.status} />
            <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
              {formattedTimeline.map((entry) => (
                <div key={entry.label} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 p-3">
                  <span className="font-medium text-foreground">{entry.label}</span>
                  <span>{entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : '—'}</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-dashed border-primary/30 bg-white/70 p-4 text-sm text-primary">
              Keep this screen open. You&apos;ll also receive a push notification when the order is Ready.
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-muted-foreground/40">
          <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
            <Clock3 className="h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">No active orders right now.</p>
            <p className="text-sm text-muted-foreground">Place an order to see live kitchen updates and pickup token.</p>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
