'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppState } from '@/providers/app-state-provider';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';
import { Loader2, Building2, Users, IndianRupee, Activity } from 'lucide-react';

export default function SuperAdminDashboardPage() {
  const { state, getDailySalesSummary } = useAppState();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading } = useDoc<UserProfile>(userDocRef);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || profile.role !== 'super-admin') {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Super admin access required.
      </div>
    );
  }

  const totalRevenue = state.orders
    .filter((order) => !['Cancelled', 'Rejected'].includes(order.status))
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const totalAdmins = state.admins.length;
  const totalCanteens = state.canteens.length;
  const dailySummary = getDailySalesSummary();

  return (
    <>
      <Header title="Platform overview" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">₹{totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Combined across all canteens.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Canteens</CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{totalCanteens}</div>
              <p className="text-xs text-muted-foreground">Managed counters on the platform.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{totalAdmins}</div>
              <p className="text-xs text-muted-foreground">Active canteen administrators.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activity logs</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{state.activityLogs.length}</div>
              <p className="text-xs text-muted-foreground">Latest 200 events tracked.</p>
            </CardContent>
          </Card>
        </section>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Sales by day</CardTitle>
            <CardDescription>Across the entire platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Revenue (₹)</TableHead>
                  <TableHead>Average order value (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailySummary.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      No data yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  dailySummary.map((day) => (
                    <TableRow key={day.date}>
                      <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                      <TableCell>{day.totalOrders}</TableCell>
                      <TableCell>₹{day.totalRevenue.toFixed(2)}</TableCell>
                      <TableCell>₹{day.averageOrderValue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
