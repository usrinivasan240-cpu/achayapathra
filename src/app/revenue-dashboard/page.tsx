'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign, TrendingUp, PieChart, BarChart3, Building2,
  ArrowUpRight, Wallet, CreditCard, Banknote, Calculator,
  ArrowDownRight, Target, Download, FileText, Users,
  ChevronRight, Award, Activity, Zap
} from 'lucide-react';
import { mockCorporates, mockPlatformAnalytics } from '@/lib/data';

function useAnimatedCounter(target: number, duration: number = 2000) {
  const [current, setCurrent] = React.useState(0);
  const startTime = React.useRef<number | null>(null);
  const frameRef = React.useRef<number>(0);

  React.useEffect(() => {
    startTime.current = null;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return current;
}

function AnimatedCurrency({ value, prefix = '₹' }: { value: number; prefix?: string }) {
  const animated = useAnimatedCounter(value, 2500);
  if (value >= 10000000) {
    return <>{prefix}{(animated / 10000000).toFixed(2)} Cr</>;
  }
  if (value >= 100000) {
    return <>{prefix}{(animated / 100000).toFixed(1)} L</>;
  }
  return <>{prefix}{animated.toLocaleString()}</>;
}

const revenueStreams = [
  {
    name: 'Individual Donations',
    amount: 4250000,
    percentage: 35,
    color: '#f97316',
    icon: Wallet,
    trend: '+14.2%',
    description: 'Direct donations from individuals across Tamil Nadu'
  },
  {
    name: 'Corporate Partnerships',
    amount: 3600000,
    percentage: 30,
    color: '#2563eb',
    icon: Building2,
    trend: '+22.8%',
    description: 'CSR and corporate food donation programs'
  },
  {
    name: 'Government Grants',
    amount: 2400000,
    percentage: 20,
    color: '#16a34a',
    icon: Banknote,
    trend: '+8.5%',
    description: 'State and central government funding schemes'
  },
  {
    name: 'CSR Fund Allocation',
    amount: 1800000,
    percentage: 15,
    color: '#9333ea',
    icon: CreditCard,
    trend: '+31.2%',
    description: 'Mandated CSR funds from registered companies'
  }
];

const monthlyRevenue = [
  { month: 'Jul', revenue: 850000, donations: 320000, corporate: 280000, government: 150000, csr: 100000 },
  { month: 'Aug', revenue: 920000, donations: 350000, corporate: 300000, government: 160000, csr: 110000 },
  { month: 'Sep', revenue: 1050000, donations: 400000, corporate: 340000, government: 180000, csr: 130000 },
  { month: 'Oct', revenue: 1180000, donations: 450000, corporate: 380000, government: 200000, csr: 150000 },
  { month: 'Nov', revenue: 1320000, donations: 500000, corporate: 420000, government: 220000, csr: 180000 },
  { month: 'Dec', revenue: 1580000, donations: 600000, corporate: 500000, government: 260000, csr: 220000 },
];

const budgetAllocation = [
  { category: 'Food Procurement', allocated: 4800000, spent: 4200000, color: '#f97316' },
  { category: 'Logistics & Delivery', allocated: 2400000, spent: 2100000, color: '#2563eb' },
  { category: 'Technology Platform', allocated: 1800000, spent: 1500000, color: '#9333ea' },
  { category: 'Volunteer Programs', allocated: 1200000, spent: 950000, color: '#16a34a' },
  { category: 'Admin & Operations', allocated: 960000, spent: 820000, color: '#eab308' },
  { category: 'Emergency Reserves', allocated: 600000, spent: 350000, color: '#ef4444' },
];

const financialProjections = [
  { quarter: 'Q1 2026', projected: 3200000, conservative: 2800000, optimistic: 3600000 },
  { quarter: 'Q2 2026', projected: 3800000, conservative: 3200000, optimistic: 4400000 },
  { quarter: 'Q3 2026', projected: 4500000, conservative: 3800000, optimistic: 5200000 },
  { quarter: 'Q4 2026', projected: 5200000, conservative: 4400000, optimistic: 6000000 },
];

function RevenueMetricCard({ icon: Icon, label, value, prefix, trend, trendUp, color, bgClass }: {
  icon: React.ElementType; label: string; value: number; prefix?: string; trend: string; trendUp: boolean; color: string; bgClass?: string;
}) {
  const animatedValue = useAnimatedCounter(value, 2500);
  return (
    <Card className={`overflow-hidden border-none shadow-sm ${bgClass || 'bg-card/50'}`}>
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-xl ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
            {trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
            {trend}
          </Badge>
        </div>
        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl md:text-3xl font-black tabular-nums">
            {prefix === '₹' ? (
              <AnimatedCurrency value={value} />
            ) : (
              animatedValue.toLocaleString()
            )}
          </span>
          {prefix !== '₹' && <span className="text-xs font-semibold text-muted-foreground">{prefix}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function MonthlyBarChart({ data }: { data: typeof monthlyRevenue }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="flex items-end gap-2 h-48 md:h-64">
      {data.map((d, i) => {
        const height = (d.revenue / maxRevenue) * 100;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <div className="text-[9px] font-bold tabular-nums text-muted-foreground">
              ₹{(d.revenue / 100000).toFixed(1)}L
            </div>
            <div className="w-full flex flex-col items-center justify-end h-36 md:h-48 gap-0.5">
              <div
                className="w-full max-w-[2rem] rounded-t-md transition-all duration-700 ease-out"
                style={{
                  height: `${Math.max(height, 4)}%`,
                  background: 'linear-gradient(180deg, #f97316 0%, #fb923c 100%)',
                }}
              />
              <div
                className="w-full max-w-[2rem] transition-all duration-700 ease-out"
                style={{
                  height: `${Math.max((d.corporate / maxRevenue) * 100, 2)}%`,
                  background: 'linear-gradient(180deg, #2563eb 0%, #60a5fa 100%)',
                }}
              />
              <div
                className="w-full max-w-[2rem] transition-all duration-700 ease-out"
                style={{
                  height: `${Math.max((d.government / maxRevenue) * 100, 2)}%`,
                  background: 'linear-gradient(180deg, #16a34a 0%, #4ade80 100%)',
                }}
              />
              <div
                className="w-full max-w-[2rem] rounded-b-md transition-all duration-700 ease-out"
                style={{
                  height: `${Math.max((d.csr / maxRevenue) * 100, 2)}%`,
                  background: 'linear-gradient(180deg, #9333ea 0%, #c084fc 100%)',
                }}
              />
            </div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

function TopCorporatePartners() {
  const sortedCorporates = React.useMemo(() => {
    return [...mockCorporates]
      .sort((a, b) => b.csrSpent - a.csrSpent)
      .slice(0, 8);
  }, []);

  const maxSpend = React.useMemo(() => {
    return Math.max(...sortedCorporates.map(c => c.csrSpent), 1);
  }, [sortedCorporates]);

  return (
    <div className="space-y-3">
      {sortedCorporates.map((corp, i) => {
        const percentage = (corp.csrSpent / maxSpend) * 100;
        return (
          <div key={i} className="group p-3 rounded-xl border bg-background/50 hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">{corp.companyName}</p>
                  <p className="text-[10px] text-muted-foreground">{corp.industry} • {corp.branches.length} branches</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black tabular-nums">
                  <AnimatedCurrency value={corp.csrSpent} />
                </p>
                <p className="text-[9px] text-muted-foreground">{corp.totalMealsServed.toLocaleString()} meals</p>
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${percentage}%`,
                  background: `linear-gradient(90deg, #f97316 0%, ${percentage > 70 ? '#fb923c' : '#fdba74'} 100%)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BudgetBreakdown() {
  const totalAllocated = budgetAllocation.reduce((a, b) => a + b.allocated, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {budgetAllocation.map((item, i) => {
          const spentPercentage = (item.spent / item.allocated) * 100;
          const shareOfTotal = (item.allocated / totalAllocated) * 100;
          return (
            <div key={i} className="p-3 rounded-xl border bg-background/50 hover:border-primary/20 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold">{item.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground">{shareOfTotal.toFixed(1)}%</span>
                  <span className="text-xs font-black tabular-nums">
                    <AnimatedCurrency value={item.allocated} />
                  </span>
                </div>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${spentPercentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[9px] text-muted-foreground">
                  Spent: <AnimatedCurrency value={item.spent} />
                </span>
                <span className="text-[9px] font-bold" style={{ color: spentPercentage > 90 ? '#ef4444' : '#16a34a' }}>
                  {spentPercentage.toFixed(0)}% utilized
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-orange-50 dark:from-primary/10 dark:to-orange-950/50 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Total Budget</p>
            <p className="text-2xl font-black"><AnimatedCurrency value={totalAllocated} /></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Total Spent</p>
            <p className="text-2xl font-black text-primary">
              <AnimatedCurrency value={budgetAllocation.reduce((a, b) => a + b.spent, 0)} />
            </p>
          </div>
        </div>
        <Progress
          value={(budgetAllocation.reduce((a, b) => a + b.spent, 0) / totalAllocated) * 100}
          className="mt-3 h-2"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          {((budgetAllocation.reduce((a, b) => a + b.spent, 0) / totalAllocated) * 100).toFixed(1)}% of total budget utilized
        </p>
      </div>
    </div>
  );
}

function ProjectionsTable() {
  return (
    <div className="space-y-3">
      {financialProjections.map((proj, i) => {
        const range = proj.optimistic - proj.conservative;
        const midPoint = ((proj.projected - proj.conservative) / range) * 100;
        return (
          <div key={i} className="p-4 rounded-xl border bg-background/50 hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold">{proj.quarter}</p>
                <p className="text-[10px] text-muted-foreground">Projected Revenue</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-primary"><AnimatedCurrency value={proj.projected} /></p>
              </div>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className="absolute inset-y-0 rounded-full transition-all duration-1000"
                style={{
                  left: '0%',
                  width: `${(proj.conservative / proj.optimistic) * 100}%`,
                  backgroundColor: '#94a3b8',
                }}
              />
              <div
                className="absolute inset-y-0 rounded-full transition-all duration-1000"
                style={{
                  left: `${(proj.conservative / proj.optimistic) * 100}%`,
                  width: `${((proj.projected - proj.conservative) / proj.optimistic) * 100}%`,
                  background: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)',
                }}
              />
              <div
                className="absolute inset-y-0 rounded-full transition-all duration-1000"
                style={{
                  left: `${(proj.projected / proj.optimistic) * 100}%`,
                  width: `${((proj.optimistic - proj.projected) / proj.optimistic) * 100}%`,
                  backgroundColor: '#4ade80',
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>Conservative: <AnimatedCurrency value={proj.conservative} /></span>
              <span className="font-bold text-primary">Target: <AnimatedCurrency value={proj.projected} /></span>
              <span>Optimistic: <AnimatedCurrency value={proj.optimistic} /></span>
            </div>
          </div>
        );
      })}

      <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
            <Target className="h-6 w-6 text-green-600" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-green-800 dark:text-green-200">2026 Annual Revenue Target</p>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">
              Based on current growth trajectory of 12.4% monthly, Achayapathra is on track to achieve
              ₹1.67 Cr total revenue by end of FY 2026-27, enabling expansion to 50+ districts.
            </p>
            <div className="flex gap-6 pt-2">
              <div>
                <p className="text-2xl font-black text-green-700 dark:text-green-300">₹1.67 Cr</p>
                <p className="text-[9px] text-green-600/60 uppercase">Projected Annual</p>
              </div>
              <div>
                <p className="text-2xl font-black text-green-700 dark:text-green-300">50+</p>
                <p className="text-[9px] text-green-600/60 uppercase">District Coverage</p>
              </div>
              <div>
                <p className="text-2xl font-black text-green-700 dark:text-green-300">+45%</p>
                <p className="text-[9px] text-green-600/60 uppercase">YoY Growth</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RevenueDashboardPage() {
  const [activeTab, setActiveTab] = React.useState('overview');

  const totalRevenue = revenueStreams.reduce((a, b) => a + b.amount, 0);
  const monthlyRecurring = 1200000;
  const growthRate = 12.4;
  const avgRevenuePerDonation = Math.round(totalRevenue / mockPlatformAnalytics.totalDonations);

  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .dark .glass-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .revenue-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(249, 115, 22, 0.08) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
      `}</style>

      <main className="flex-1 pb-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 text-white">
          <div className="absolute inset-0 revenue-shimmer opacity-40" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative p-6 md:p-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                  <DollarSign className="h-6 w-6 text-orange-200" />
                </div>
                <Badge className="bg-white/15 text-white border-white/20 text-[10px] backdrop-blur-sm">
                  Financial Overview
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
                <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                  <FileText className="mr-2 h-4 w-4" /> Report
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-orange-200/80 text-xs font-bold uppercase tracking-widest">Total Revenue FY 2025-26</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-7xl font-black tabular-nums tracking-tighter">
                  <AnimatedCurrency value={totalRevenue} />
                </span>
              </div>
              <p className="text-xs text-orange-200/60 max-w-md">
                Revenue from {mockPlatformAnalytics.totalDonations.toLocaleString()} donations across {mockPlatformAnalytics.totalNGOs} partner NGOs
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {[
                { icon: Wallet, label: 'Monthly Recurring', value: `₹${(monthlyRecurring / 100000).toFixed(1)}L`, color: 'text-orange-200' },
                { icon: TrendingUp, label: 'Growth Rate', value: `+${growthRate}%`, color: 'text-green-200' },
                { icon: Users, label: 'Avg per Donation', value: `₹${avgRevenuePerDonation.toLocaleString()}`, color: 'text-yellow-200' },
                { icon: Target, label: 'FY Target', value: '₹1.67 Cr', color: 'text-amber-200' },
              ].map((item, i) => (
                <div key={i} className="glass-card rounded-xl p-3 text-white">
                  <item.icon className={`h-4 w-4 ${item.color} mb-1.5`} />
                  <p className="text-[9px] font-bold uppercase tracking-wider text-orange-200/60">{item.label}</p>
                  <p className="text-lg font-black tabular-nums">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-6 md:space-y-8">

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              <TabsTrigger value="overview" className="text-[10px] md:text-xs py-2.5">
                <BarChart3 className="h-3.5 w-3.5 mr-1 hidden md:block" /> Overview
              </TabsTrigger>
              <TabsTrigger value="streams" className="text-[10px] md:text-xs py-2.5">
                <PieChart className="h-3.5 w-3.5 mr-1 hidden md:block" /> Streams
              </TabsTrigger>
              <TabsTrigger value="budget" className="text-[10px] md:text-xs py-2.5">
                <Calculator className="h-3.5 w-3.5 mr-1 hidden md:block" /> Budget
              </TabsTrigger>
              <TabsTrigger value="projections" className="text-[10px] md:text-xs py-2.5">
                <TrendingUp className="h-3.5 w-3.5 mr-1 hidden md:block" /> Projections
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <RevenueMetricCard icon={DollarSign} label="Total Revenue" value={totalRevenue} trend="+18.5%" trendUp color="bg-orange-500" />
                <RevenueMetricCard icon={Wallet} label="Monthly Recurring" value={monthlyRecurring} trend="+12.4%" trendUp color="bg-blue-500" />
                <RevenueMetricCard icon={TrendingUp} label="Growth Rate" value={Math.round(growthRate * 100)} prefix="%" trend="+2.1pp" trendUp color="bg-green-500" />
                <RevenueMetricCard icon={Building2} label="Corporate Partners" value={mockCorporates.length} prefix="" trend="+8 new" trendUp color="bg-purple-500" />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Monthly Revenue Trend */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                      Monthly Revenue Trend
                    </CardTitle>
                    <CardDescription className="text-xs">6-month revenue breakdown by source</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MonthlyBarChart data={monthlyRevenue} />
                    <div className="flex items-center justify-center gap-4 mt-4">
                      {[
                        { label: 'Donations', color: 'bg-orange-500' },
                        { label: 'Corporate', color: 'bg-blue-500' },
                        { label: 'Government', color: 'bg-green-500' },
                        { label: 'CSR', color: 'bg-purple-500' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                          <span className="text-[9px] font-bold text-muted-foreground">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Corporate Partners */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      Top Corporate Partners
                    </CardTitle>
                    <CardDescription className="text-xs">Highest contributing corporate donors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TopCorporatePartners />
                  </CardContent>
                </Card>
              </div>

              {/* Revenue Streams Quick View */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-primary" />
                    Revenue Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {revenueStreams.map((stream, i) => (
                      <div key={i} className="p-4 rounded-xl border bg-background/50 hover:border-primary/20 transition-all text-center">
                        <div className="p-2 rounded-xl mx-auto w-fit mb-3" style={{ backgroundColor: `${stream.color}15` }}>
                          <stream.icon className="h-5 w-5" style={{ color: stream.color }} />
                        </div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{stream.name}</p>
                        <p className="text-xl font-black tabular-nums"><AnimatedCurrency value={stream.amount} /></p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <ArrowUpRight className="h-3 w-3 text-green-500" />
                          <span className="text-[9px] font-bold text-green-500">{stream.trend}</span>
                        </div>
                        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mt-3">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                            style={{ width: `${stream.percentage}%`, backgroundColor: stream.color }}
                          />
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1">{stream.percentage}% of total</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Streams Tab */}
            <TabsContent value="streams" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-orange-600" />
                    Revenue Streams
                  </h2>
                  <p className="text-xs text-muted-foreground">Detailed breakdown of all revenue sources</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {revenueStreams.length} Active Streams
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {revenueStreams.map((stream, i) => (
                  <Card key={i} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-1.5" style={{ backgroundColor: stream.color }} />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${stream.color}15` }}>
                            <stream.icon className="h-6 w-6" style={{ color: stream.color }} />
                          </div>
                          <div>
                            <p className="font-bold">{stream.name}</p>
                            <p className="text-xs text-muted-foreground">{stream.description}</p>
                          </div>
                        </div>
                        <Badge className="text-[10px]" style={{ backgroundColor: `${stream.color}15`, color: stream.color, borderColor: `${stream.color}30` }}>
                          <ArrowUpRight className="h-3 w-3 mr-0.5" />
                          {stream.trend}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-3xl font-black tabular-nums"><AnimatedCurrency value={stream.amount} /></span>
                          <span className="text-sm font-bold" style={{ color: stream.color }}>{stream.percentage}%</span>
                        </div>
                        <Progress value={stream.percentage} className="h-2" />
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-2 rounded-lg bg-muted/50 text-center">
                            <p className="text-[9px] text-muted-foreground uppercase">Monthly Avg</p>
                            <p className="font-bold tabular-nums"><AnimatedCurrency value={Math.round(stream.amount / 12)} /></p>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/50 text-center">
                            <p className="text-[9px] text-muted-foreground uppercase">Per Transaction</p>
                            <p className="font-bold tabular-nums">₹{Math.round(stream.amount / mockPlatformAnalytics.totalDonations * 100)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Stream Comparison */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider">
                    Stream Performance Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {revenueStreams.map((stream, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-32 shrink-0">
                          <p className="text-xs font-bold truncate">{stream.name}</p>
                        </div>
                        <div className="flex-1 relative h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                            style={{ width: `${stream.percentage * 3.33}%`, backgroundColor: stream.color }}
                          />
                        </div>
                        <div className="w-20 text-right shrink-0">
                          <p className="text-xs font-black tabular-nums"><AnimatedCurrency value={stream.amount} /></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Budget Tab */}
            <TabsContent value="budget" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-purple-600" />
                    Budget Allocation
                  </h2>
                  <p className="text-xs text-muted-foreground">Fund utilization and budget tracking</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  <Activity className="h-3 w-3 mr-1" /> Live Tracking
                </Badge>
              </div>

              <BudgetBreakdown />

              {/* Fund Utilization Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                        <Wallet className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Total Allocated</p>
                        <p className="text-lg font-black tabular-nums">
                          <AnimatedCurrency value={budgetAllocation.reduce((a, b) => a + b.allocated, 0)} />
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Total Spent</p>
                        <p className="text-lg font-black tabular-nums text-green-600">
                          <AnimatedCurrency value={budgetAllocation.reduce((a, b) => a + b.spent, 0)} />
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <Banknote className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Remaining</p>
                        <p className="text-lg font-black tabular-nums text-blue-600">
                          <AnimatedCurrency value={budgetAllocation.reduce((a, b) => a + (b.allocated - b.spent), 0)} />
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Projections Tab */}
            <TabsContent value="projections" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Financial Projections
                  </h2>
                  <p className="text-xs text-muted-foreground">Revenue forecasts and growth targets</p>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                  <Zap className="h-3 w-3 mr-1" /> AI Predicted
                </Badge>
              </div>

              <ProjectionsTable />

              {/* Growth Metrics */}
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: 'QoQ Growth', value: '+15.8%', icon: TrendingUp, color: 'text-green-600 bg-green-50 dark:bg-green-950' },
                  { label: 'YoY Growth', value: '+45.2%', icon: BarChart3, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
                  { label: 'Revenue per NGO', value: '₹1.2L', icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' },
                  { label: 'Donor Retention', value: '87%', icon: Award, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950' },
                ].map((metric, i) => (
                  <Card key={i} className="border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className={`p-2 rounded-xl ${metric.color} w-fit mb-2`}>
                        <metric.icon className="h-4 w-4" />
                      </div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{metric.label}</p>
                      <p className="text-xl font-black tabular-nums">{metric.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="text-center space-y-3 max-w-2xl mx-auto py-8 border-t border-dashed">
            <div className="flex items-center justify-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-black uppercase tracking-tighter">Achayapathra Financial Dashboard</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Transparent financial management for food redistribution. Every rupee tracked,
              every meal accounted for. Our revenue fuels the mission to eliminate hunger across Tamil Nadu.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}
