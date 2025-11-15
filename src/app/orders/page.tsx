'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ChefHat, ReceiptIndianRupee } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { AppShell } from '@/components/canteen/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface OrderListItem {
  _id: string;
  tokenNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    item: {
      name: string;
      imageUrl?: string;
    };
    qty: number;
    price: number;
  }>;
}

const statusColor: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Cooking: 'bg-blue-100 text-blue-700',
  Ready: 'bg-emerald-100 text-emerald-700',
  Delivered: 'bg-emerald-200 text-emerald-800',
  Cancelled: 'bg-rose-100 text-rose-700',
  Rejected: 'bg-rose-100 text-rose-700',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderListItem[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      try {
        const response = await apiClient.get('/orders/my');
        setOrders(response.data.orders || []);
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Unable to fetch orders', description: error.message });
      }
    };

    loadOrders();
  }, [toast, user]);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl">Order history</h1>
          <p className="text-muted-foreground">Track billings, re-order favourites and monitor delivery timelines.</p>
        </div>
        <Button asChild>
          <Link href="/home" className="gap-2">
            <ChefHat className="h-4 w-4" /> Order more
          </Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed border-muted-foreground/40">
          <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
            <ReceiptIndianRupee className="h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium">No orders yet.</p>
            <p className="text-sm text-muted-foreground">Place your first order and it will appear here.</p>
            <Button asChild>
              <Link href="/home" className="gap-2">
                Browse menu <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="border-muted/60">
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    Token {order.tokenNumber}
                    <Badge className={statusColor[order.status] || 'bg-muted text-foreground'}>{order.status}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {new Date(order.createdAt).toLocaleString()} • ₹{order.totalAmount.toFixed(2)}
                  </CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/track-order?order=${order._id}`}>Track</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={`${order._id}-${index}`} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.item?.name || 'Menu item'}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                    </div>
                    <span>₹{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total paid</span>
                  <span className="text-base font-semibold">₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
