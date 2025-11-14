'use client';

import * as React from 'react';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppState } from '@/providers/app-state-provider';
import { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function AdminReportsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { getDailySalesSummary } = useAppState();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading } = useDoc<UserProfile>(userDocRef);

  const dailySummary = React.useMemo(() => {
    if (!profile?.canteenId) return [];
    return getDailySalesSummary(profile.canteenId);
  }, [getDailySalesSummary, profile?.canteenId]);

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

  const totalRevenue = dailySummary.reduce((sum, day) => sum + day.totalRevenue, 0);
  const totalOrders = dailySummary.reduce((sum, day) => sum + day.totalOrders, 0);

  return (
    <>
      <Header title="Sales reports" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Total revenue</CardTitle>
              <CardDescription>Last {dailySummary.length} days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-900">₹{totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total orders</CardTitle>
              <CardDescription>Delivered meals only</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-900">{totalOrders}</p>
            </CardContent>
          </Card>
        </section>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Daily breakdown</CardTitle>
            <CardDescription>GST-inclusive totals</CardDescription>
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
                      No orders recorded yet.
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
