'use client';

import * as React from 'react';
import Link from 'next/link';
import { CalendarDays, Receipt, Wallet } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/providers/app-state-provider';
import { useUser } from '@/firebase';

const statusFilters = ['All', 'Delivered', 'Cancelled', 'Rejected'];

export default function OrderHistoryPage() {
  const { state } = useAppState();
  const { user } = useUser();
  const [filter, setFilter] = React.useState<(typeof statusFilters)[number]>('All');

  const orders = React.useMemo(() => {
    if (!user) return [];
    return state.orders
      .filter((order) => order.userId === user.uid)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [state.orders, user]);

  const filteredOrders = React.useMemo(() => {
    if (filter === 'All') return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  const totalSpent = React.useMemo(() => {
    return orders
      .filter((order) => order.status === 'Delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0);
  }, [orders]);

  const totalOrders = orders.length;
  const cancelledOrders = orders.filter((order) => ['Cancelled', 'Rejected'].includes(order.status)).length;

  return (
    <>
      <Header title="Order history" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-base">Total orders</CardTitle>
              <Receipt className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-900">{totalOrders}</p>
              <p className="text-sm text-slate-500">Across all campus counters</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-base">Delivered value</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-900">₹{totalSpent.toFixed(2)}</p>
              <p className="text-sm text-slate-500">Only includes completed orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-base">Cancelled or rejected</CardTitle>
              <CalendarDays className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-900">{cancelledOrders}</p>
              <p className="text-sm text-slate-500">Marked by the canteen admin</p>
            </CardContent>
          </Card>
        </section>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as (typeof statusFilters)[number])}>
          <TabsList className="flex flex-wrap gap-2 bg-white">
            {statusFilters.map((status) => (
              <TabsTrigger key={status} value={status} className="rounded-full px-4 py-1 text-sm">
                {status}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={filter} className="mt-6 space-y-3">
            {filteredOrders.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-sm text-slate-500">
                  No orders for this filter yet.
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="border-slate-200">
                  <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">
                        Token {order.tokenNumber} • ₹{order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        {order.items.map((item) => (
                          <span key={item.menuItemId} className="rounded-full bg-slate-100 px-2 py-1">
                            {item.qty} × {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <Badge variant={order.status === 'Delivered' ? 'outline' : 'secondary'}>
                        {order.status}
                      </Badge>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
                      >
                        View timeline
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
