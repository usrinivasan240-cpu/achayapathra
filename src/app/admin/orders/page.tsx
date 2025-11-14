'use client';

import * as React from 'react';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Check, Loader2, Timer, Utensils } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppState } from '@/providers/app-state-provider';
import { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const nextStatusMap: Record<string, string> = {
  Pending: 'Cooking',
  Cooking: 'Ready',
  Ready: 'Delivered',
};

const statusOptions = ['Pending', 'Cooking', 'Ready', 'Delivered', 'Cancelled', 'Rejected'] as const;

export default function AdminOrdersPage() {
  const { state, updateOrderStatus } = useAppState();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading } = useDoc<UserProfile>(userDocRef);
  const [counterFilter, setCounterFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('active');

  const orders = React.useMemo(() => {
    if (!profile?.canteenId) return [];
    return state.orders
      .filter((order) => order.canteenId === profile.canteenId)
      .filter((order) => (
        counterFilter === 'all' ? true : order.counterId === counterFilter
      ))
      .filter((order) => {
        if (statusFilter === 'active') {
          return ['Pending', 'Cooking', 'Ready'].includes(order.status);
        }
        if (statusFilter === 'completed') {
          return ['Delivered'].includes(order.status);
        }
        if (statusFilter === 'flagged') {
          return ['Cancelled', 'Rejected'].includes(order.status);
        }
        return true;
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [state.orders, profile?.canteenId, counterFilter, statusFilter]);

  const counters = React.useMemo(() => {
    const canteen = state.canteens.find((entry) => entry.id === profile?.canteenId);
    return canteen?.counters ?? [];
  }, [state.canteens, profile?.canteenId]);

  const handleAdvance = (orderId: string, currentStatus: string) => {
    const nextStatus = nextStatusMap[currentStatus];
    if (!nextStatus) return;
    const updated = updateOrderStatus({
      orderId,
      status: nextStatus as any,
      actor: {
        id: user?.uid ?? 'admin',
        name: profile?.displayName ?? 'Admin',
        role: 'admin',
      },
    });
    if (updated) {
      toast({ title: `Order ${updated.tokenNumber} marked ${updated.status}.` });
    }
  };

  const handleMarkCancelled = (orderId: string, status: 'Cancelled' | 'Rejected') => {
    const updated = updateOrderStatus({
      orderId,
      status,
      actor: {
        id: user?.uid ?? 'admin',
        name: profile?.displayName ?? 'Admin',
        role: 'admin',
      },
    });
    if (updated) {
      toast({
        title: `Order ${updated.tokenNumber} ${status.toLowerCase()}.`,
        description: 'Customer will be notified instantly.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Admin access required.
      </div>
    );
  }

  return (
    <>
      <Header title="Manage orders" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <Card className="border-slate-200">
          <CardHeader className="space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
            <div>
              <CardTitle className="text-xl">Live queue</CardTitle>
              <CardDescription>
                Update order statuses and keep students informed in real time.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={counterFilter} onValueChange={setCounterFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Counter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All counters</SelectItem>
                  {counters.map((counter) => (
                    <SelectItem key={counter.id} value={counter.id}>
                      {counter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Delivered</SelectItem>
                  <SelectItem value="flagged">Cancelled / Rejected</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-muted-foreground">
                No orders for this filter.
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto]"
                >
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="outline">Token {order.tokenNumber}</Badge>
                      <Badge variant="secondary">{order.counterId.replace(/-/g, ' ')}</Badge>
                      <Badge variant={['Cancelled', 'Rejected'].includes(order.status) ? 'destructive' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="font-semibold text-slate-800">
                      ₹{order.totalAmount.toFixed(2)} • {order.items.length} items
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last updated {new Date(order.updatedAt).toLocaleTimeString()}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                      {order.items.map((item) => (
                        <span key={item.menuItemId} className="rounded-full bg-slate-100 px-2 py-1">
                          {item.qty}× {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-stretch justify-center gap-2">
                    {nextStatusMap[order.status] && (
                      <Button onClick={() => handleAdvance(order.id, order.status)}>
                        <Check className="mr-2 h-4 w-4" /> Mark {nextStatusMap[order.status]}
                      </Button>
                    )}
                    {order.status !== 'Cancelled' && order.status !== 'Rejected' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleMarkCancelled(order.id, 'Cancelled')}
                        >
                          <Timer className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 text-rose-600 hover:text-rose-700"
                          onClick={() => handleMarkCancelled(order.id, 'Rejected')}
                        >
                          <Utensils className="mr-2 h-4 w-4" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
