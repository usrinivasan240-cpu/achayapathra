'use client';
import * as React from 'react';
import { Zap, Leaf, Clock, ArrowUpRight, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { RecentDonations } from '@/components/dashboard/recent-donations';
import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Donation, UserProfile } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/language-context';

const Overview = dynamic(() => import('../../components/dashboard/overview'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[200px] md:h-[350px]"><Loader2 className="h-8 w-8 animate-spin" /></div>
});

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { isAdminLoading } = useAdmin();
  const { t } = useLanguage();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userDocRef);

  const userDonationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'donations'), where('donorId', '==', user.uid));
  }, [firestore, user]);

  const { data: userDonations, isLoading: donationsLoading } = useCollection<Donation>(userDonationsQuery);

  const allDonationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'donations');
  }, [firestore]);
  const { data: allDonations } = useCollection<Donation>(allDonationsQuery);

  const isLoading = isUserLoading || profileLoading || donationsLoading || isAdminLoading;

  const stats = React.useMemo(() => {
    if (!allDonations) return { efficiency: 0, co2: 0, deliveryTime: 0 };
    const rescued = allDonations.filter(d => d.status === 'Delivered').length;
    const totalKg = allDonations.reduce((acc, d) => acc + (d.quantity_kg || 0.5), 0);
    return {
      efficiency: allDonations.length > 0 ? (rescued / allDonations.length) * 100 : 0,
      co2: totalKg * 2.5,
      deliveryTime: allDonations.length > 0 ? 22 : 0
    };
  }, [allDonations]);

  const chartData = React.useMemo(() => {
    if (!allDonations || allDonations.length === 0) {
      return [
        { name: 'Jan', total: 0 },
        { name: 'Feb', total: 0 },
        { name: 'Mar', total: 0 },
        { name: 'Apr', total: 0 },
        { name: 'May', total: 0 },
        { name: 'Jun', total: 0 },
        { name: 'Jul', total: 0 },
      ];
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last7Months: { name: string; month: number; total: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last7Months.push({
        name: monthNames[monthIndex],
        month: monthIndex,
        total: 0
      });
    }

    allDonations.forEach(donation => {
      if (donation.createdAt) {
        const date = (donation.createdAt as any).toDate ? (donation.createdAt as any).toDate() : new Date(donation.createdAt as any);
        const month = date.getMonth();
        const entry = last7Months.find(m => m.month === month);
        if (entry) entry.total += 1;
      }
    });

    return last7Months.map(m => ({ name: m.name, total: m.total }));
  }, [allDonations]);

  if (isLoading) {
    return (
      <>
        <Header title={t('dashboard.title')} />
        <div className="flex flex-1 items-center justify-center h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t('dashboard.title')} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        
        {/* Core Metrics */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm border-none bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('dashboard.efficiency')}</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl md:text-2xl font-black">{stats.efficiency.toFixed(1)}%</div>
              <Progress value={stats.efficiency} className="mt-2 h-1" />
              <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase leading-none">{t('dashboard.efficiencyDesc')}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('dashboard.co2')}</CardTitle>
              <Leaf className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl md:text-2xl font-black">{stats.co2.toFixed(1)} kg</div>
              <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase leading-none">{t('dashboard.co2Desc')}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('dashboard.avgTime')}</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl md:text-2xl font-black">{stats.deliveryTime}m</div>
              <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase leading-none">{t('dashboard.avgTimeDesc')}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
              <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('dashboard.impactPoints')}</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl md:text-2xl font-black">{userProfile?.points || 0}</div>
              <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase leading-none">{t('dashboard.rank')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2 shadow-sm">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">{t('dashboard.trends')}</CardTitle>
              <CardDescription className="text-xs">{t('dashboard.trendsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-2 md:pl-2">
              <Overview data={chartData} />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">{t('dashboard.feed')}</CardTitle>
              <CardDescription className="text-xs">{t('dashboard.feedDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <RecentDonations />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}