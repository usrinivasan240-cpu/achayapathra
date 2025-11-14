'use client';

import * as React from 'react';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, PackageCheck, Pizza, TrendingUp, Users } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/providers/app-state-provider';
import { UserProfile } from '@/lib/types';

export default function AdminDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { state } = useAppState();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading } = useDoc<UserProfile>(userDocRef);

  const orders = React.useMemo(() => {
    if (!profile?.canteenId) return [];
    return state.orders
      .filter((order) => order.canteenId === profile.canteenId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [state.orders, profile?.canteenId]);

  const activeOrders = orders.filter((order) => ['Pending', 'Cooking', 'Ready'].includes(order.status)).length;
  const readyOrders = orders.filter((order) => order.status === 'Ready').length;
  const deliveredToday = orders.filter((order) => {
    const sameDay = new Date(order.createdAt).toDateString() === new Date().toDateString();
    return sameDay && order.status === 'Delivered';
  }).length;
  const revenueToday = orders.reduce((sum, order) => {
    const sameDay = new Date(order.createdAt).toDateString() === new Date().toDateString();
    if (!sameDay || ['Cancelled', 'Rejected'].includes(order.status)) return sum;
    return sum + order.totalAmount;
  }, 0);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-slate-500">
        Admin access required.
      </div>
    );
  }

  return (
    <>
      <Header title="Admin dashboard" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active orders</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{activeOrders}</div>
              <p className="text-xs text-muted-foreground">Including pending, cooking and ready tokens.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready for pickup</CardTitle>
              <PackageCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{readyOrders}</div>
              <p className="text-xs text-muted-foreground">Awaiting students at the counter.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered today</CardTitle>
              <Pizza className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{deliveredToday}</div>
              <p className="text-xs text-muted-foreground">Updated each time an order is closed.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue today</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">₹{revenueToday.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Excludes cancelled or refunded orders.</p>
            </CardContent>
          </Card>
        </section>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Manage the queue across counters in real time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Updated at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 8).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-semibold">{order.tokenNumber}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {order.items.map((item) => `${item.qty}× ${item.name}`).join(', ')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={['Cancelled', 'Rejected'].includes(order.status) ? 'destructive' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(order.updatedAt).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {orders.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No orders yet for this canteen.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
