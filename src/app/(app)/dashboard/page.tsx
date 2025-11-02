
'use client';

import { Award, CreditCard, Package, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Overview } from '@/components/dashboard/overview';
import { RecentDonations } from '@/components/dashboard/recent-donations';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Donation, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users'), where('id', '==', user.uid));
  }, [firestore, user]);

  const { data: userData, isLoading: isUsersLoading } = useCollection<User>(userQuery);
  const currentUser = userData?.[0];

  const donationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'donations'), where('donorId', '==', user.uid));
  }, [firestore, user]);

  const { data: donations, isLoading: isDonationsLoading } = useCollection<Donation>(donationsQuery);
  
  const isLoading = isUserLoading || isUsersLoading || isDonationsLoading;

  const totalDonations = donations?.length || 0;
  const activeDonations = donations?.filter(d => d.status === 'Available' || d.status === 'Pending').length || 0;

  if (isLoading || !currentUser) {
    return (
        <>
            <Header title="Dashboard" />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                    <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-4 w-32" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-4 w-20" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-4 w-28" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>
                </div>
                 <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader><CardTitle>Donation Trends</CardTitle></CardHeader>
                        <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Recent Donations</CardTitle></CardHeader>
                        <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
                    </Card>
                 </div>
            </main>
        </>
    )
  }

  return (
    <>
      <Header title="Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Points</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentUser.points}</div>
              <p className="text-xs text-muted-foreground">
                Keep up the great work!
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Donations Made
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{totalDonations}</div>
              <p className="text-xs text-muted-foreground">
                Thank you for your contributions.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#5</div>
              <p className="text-xs text-muted-foreground">
                Top 10% this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Donations
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{activeDonations}</div>
              <p className="text-xs text-muted-foreground">
                Currently available for pickup.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Donation Trends</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentDonations />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
