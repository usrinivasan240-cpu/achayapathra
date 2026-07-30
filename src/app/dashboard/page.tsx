'use client';
import * as React from 'react';
import { Zap, Leaf, Clock, ArrowUpRight, Loader2, Users, Building2, Truck, TrendingUp, Globe, Recycle, Sparkles, Award, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { RecentDonations } from '@/components/dashboard/recent-donations';
import { useUser, useFirestore, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Donation, UserProfile } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/language-context';
import { mockPlatformAnalytics, mockDistricts, mockHungerZones } from '@/lib/data';

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
    if (!allDonations || allDonations.length === 0) {
      return {
        efficiency: mockPlatformAnalytics.matchSuccessRate,
        co2: mockPlatformAnalytics.totalCO2Saved,
        deliveryTime: mockPlatformAnalytics.avgDeliveryTime,
        totalDonations: mockPlatformAnalytics.totalDonations,
        totalMeals: mockPlatformAnalytics.totalMealsServed,
        activeNGOs: mockPlatformAnalytics.totalNGOs,
        activeVolunteers: mockPlatformAnalytics.totalVolunteers,
        dailyActive: mockPlatformAnalytics.dailyActiveUsers,
        monthlyGrowth: mockPlatformAnalytics.monthlyGrowth,
        biogasRedirected: mockPlatformAnalytics.totalBiogasRedirected,
        fertilizerRedirected: mockPlatformAnalytics.totalFertilizerRedirected,
      };
    }
    const rescued = allDonations.filter(d => d.status === 'Delivered').length;
    const totalKg = allDonations.reduce((acc, d) => acc + (d.quantity_kg || 0.5), 0);
    return {
      efficiency: allDonations.length > 0 ? (rescued / allDonations.length) * 100 : mockPlatformAnalytics.matchSuccessRate,
      co2: totalKg * 2.5 || mockPlatformAnalytics.totalCO2Saved,
      deliveryTime: allDonations.length > 0 ? 22 : mockPlatformAnalytics.avgDeliveryTime,
      totalDonations: allDonations.length || mockPlatformAnalytics.totalDonations,
      totalMeals: rescued * 12 + 4500 || mockPlatformAnalytics.totalMealsServed,
      activeNGOs: mockPlatformAnalytics.totalNGOs,
      activeVolunteers: mockPlatformAnalytics.totalVolunteers,
      dailyActive: mockPlatformAnalytics.dailyActiveUsers,
      monthlyGrowth: mockPlatformAnalytics.monthlyGrowth,
      biogasRedirected: mockPlatformAnalytics.totalBiogasRedirected,
      fertilizerRedirected: mockPlatformAnalytics.totalFertilizerRedirected,
    };
  }, [allDonations]);

  const chartData = React.useMemo(() => {
    if (!allDonations || allDonations.length === 0) {
      return [
        { name: 'Jan', total: 45 },
        { name: 'Feb', total: 62 },
        { name: 'Mar', total: 78 },
        { name: 'Apr', total: 95 },
        { name: 'May', total: 110 },
        { name: 'Jun', total: 125 },
        { name: 'Jul', total: 140 },
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
        
        {/* Platform Overview Banner */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <h2 className="text-lg md:text-xl font-bold font-headline flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Achayapathra — India's Circular Food Economy Platform
                </h2>
                <p className="text-xs text-muted-foreground">
                  Connecting {stats.activeNGOs} NGOs, {stats.activeVolunteers.toLocaleString()} Volunteers, {stats.totalDonations.toLocaleString()} Donations across Tamil Nadu
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/ai-insights">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Zap className="mr-1 h-3 w-3" /> AI Insights
                  </Button>
                </Link>
                <Link href="/public-impact">
                  <Button size="sm" className="text-xs">
                    <Globe className="mr-1 h-3 w-3" /> Public Impact
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Metrics */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
          <Card className="shadow-sm border-none bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{t('dashboard.efficiency')}</p>
                <Zap className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="text-xl md:text-2xl font-black">{stats.efficiency.toFixed(1)}%</div>
              <Progress value={stats.efficiency} className="mt-2 h-1" />
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{t('dashboard.co2')}</p>
                <Leaf className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-xl md:text-2xl font-black">{(stats.co2 / 1000).toFixed(1)}T</div>
              <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">≈ {Math.round(stats.co2 / 21.77).toLocaleString()} trees</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{t('dashboard.avgTime')}</p>
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-xl md:text-2xl font-black">{stats.deliveryTime}m</div>
              <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">Avg. Delivery</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{t('dashboard.totalMeals')}</p>
                <Users className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-xl md:text-2xl font-black">{(stats.totalMeals / 1000).toFixed(0)}K</div>
              <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">Meals Served</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{t('dashboard.impactPoints')}</p>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </div>
              <div className="text-xl md:text-2xl font-black">{userProfile?.points || 0}</div>
              <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase">Your Points</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-none bg-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase text-green-700 tracking-wider">Circular Economy</p>
                <Recycle className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-xl md:text-2xl font-black text-green-600">{(stats.biogasRedirected / 1000).toFixed(1)}T</div>
              <p className="text-[9px] font-bold text-green-600 mt-1 uppercase">Redirected to Biogas</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          {[
            { href: '/tracking', label: 'Track Donation', icon: Truck, color: 'text-blue-500' },
            { href: '/food-safety', label: 'Food Safety AI', icon: Zap, color: 'text-green-500' },
            { href: '/live-maps', label: 'Live Maps', icon: Globe, color: 'text-purple-500' },
            { href: '/certificates', label: 'Certificates', icon: Award, color: 'text-orange-500' },
            { href: '/emergency', label: 'Emergency', icon: AlertTriangle, color: 'text-red-500' },
            { href: '/carbon-dashboard', label: 'Carbon Impact', icon: Leaf, color: 'text-green-600' },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/30 group">
                <CardContent className="p-3 flex items-center gap-2">
                  <action.icon className={`h-5 w-5 ${action.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs font-bold truncate">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
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

        {/* Top Districts */}
        <Card className="shadow-sm">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top District Impact
            </CardTitle>
            <CardDescription className="text-xs">District-wise food redistribution performance</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {mockDistricts.sort((a, b) => b.totalMealsServed - a.totalMealsServed).slice(0, 6).map((district, i) => (
                <div key={i} className="p-3 border rounded-xl bg-background hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{district.name}</span>
                    <Badge variant={district.hungerRiskScore > 70 ? 'destructive' : 'secondary'} className="text-[10px]">
                      Risk: {district.hungerRiskScore}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><p className="text-muted-foreground">Meals</p><p className="font-bold">{(district.totalMealsServed / 1000).toFixed(1)}K</p></div>
                    <div><p className="text-muted-foreground">NGOs</p><p className="font-bold">{district.totalNGOs}</p></div>
                    <div><p className="text-muted-foreground">CO₂</p><p className="font-bold">{(district.carbonSavedKg / 1000).toFixed(1)}T</p></div>
                    <div><p className="text-muted-foreground">Biogas</p><p className="font-bold">{district.biogasCentres}</p></div>
                  </div>
                  <Progress value={district.totalMealsServed / 1000} className="mt-2 h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </main>
    </>
  );
}
