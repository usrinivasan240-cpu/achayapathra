'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Leaf, Globe, Droplets, TreePine, Zap, Factory, Recycle,
  TrendingUp, BarChart3, ArrowUpRight, Wind, Sun, Trash2,
  ChevronRight, Activity, Award, Target, Flame
} from 'lucide-react';
import {
  mockDistricts, mockBiogasPlants, mockFertilizerCentres,
  mockPlatformAnalytics, mockDonations, mockImpactStats
} from '@/lib/data';
import { District, BiogasPlant, FertilizerCentre, Donation } from '@/lib/types';

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

function CircularGauge({ value, max, size = 120, strokeWidth = 8, color = '#16a34a', label, sublabel }: {
  value: number; max: number; size?: number; strokeWidth?: number; color?: string; label: string; sublabel?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor"
            strokeWidth={strokeWidth} className="text-muted/50" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black">{Math.round(percentage)}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
        {sublabel && <p className="text-[10px] text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}

function CarbonMetricCard({ icon: Icon, label, value, unit, color, bgClass }: {
  icon: React.ElementType; label: string; value: number; unit: string; color: string; bgClass?: string;
}) {
  const animatedValue = useAnimatedCounter(value, 2500);
  return (
    <Card className={`overflow-hidden border-none shadow-sm ${bgClass || 'bg-card/50'}`}>
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-xl ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
            <ArrowUpRight className="h-3 w-3 mr-0.5" />
            Live
          </Badge>
        </div>
        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl md:text-3xl font-black tabular-nums">
            {animatedValue.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-muted-foreground">{unit}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function DistrictBar({ district, maxCarbon }: { district: District; maxCarbon: number }) {
  const percentage = maxCarbon > 0 ? (district.carbonSavedKg / maxCarbon) * 100 : 0;
  return (
    <div className="space-y-1.5 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold truncate pr-2">{district.name}</span>
        <span className="text-[10px] font-bold text-green-600 tabular-nums shrink-0">
          {(district.carbonSavedKg / 1000).toFixed(1)}T
        </span>
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, #16a34a 0%, ${percentage > 70 ? '#22c55e' : '#4ade80'} 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
}

function FacilityCard({ facility, type }: { facility: BiogasPlant | FertilizerCentre; type: 'biogas' | 'fertilizer' }) {
  const utilization = facility.capacity > 0 ? (facility.currentInput / facility.capacity) * 100 : 0;
  return (
    <div className="p-4 border rounded-xl bg-background/50 hover:border-primary/30 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {type === 'biogas' ? (
            <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Factory className="h-4 w-4 text-green-600" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Recycle className="h-4 w-4 text-amber-600" />
            </div>
          )}
          <div>
            <p className="text-xs font-bold leading-tight">{facility.name}</p>
            <p className="text-[10px] text-muted-foreground">{facility.district}</p>
          </div>
        </div>
        <Badge variant={facility.operational ? 'default' : 'secondary'} className="text-[9px]">
          {facility.operational ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Utilization</span>
          <span className="font-bold">{utilization.toFixed(0)}%</span>
        </div>
        <Progress value={utilization} className="h-1.5" />
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="text-center p-1.5 rounded-lg bg-muted/50">
            <p className="text-[9px] text-muted-foreground uppercase">Capacity</p>
            <p className="text-xs font-bold">{facility.capacity.toLocaleString()}kg</p>
          </div>
          <div className="text-center p-1.5 rounded-lg bg-muted/50">
            <p className="text-[9px] text-muted-foreground uppercase">
              {type === 'biogas' ? 'Energy' : 'Compost'}
            </p>
            <p className="text-xs font-bold">
              {type === 'biogas'
                ? `${(facility as BiogasPlant).energyOutputKwh.toLocaleString()}kWh`
                : `${(facility as FertilizerCentre).compostOutputKg.toLocaleString()}kg`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthlyTrendBar({ month, carbon, maxCarbon }: { month: string; carbon: number; maxCarbon: number }) {
  const percentage = maxCarbon > 0 ? (carbon / maxCarbon) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <div className="w-full flex flex-col items-center justify-end h-24 md:h-32">
        <div
          className="w-full max-w-[2rem] rounded-t-md transition-all duration-500 ease-out"
          style={{
            height: `${Math.max(percentage, 4)}%`,
            background: percentage > 60
              ? 'linear-gradient(180deg, #16a34a 0%, #22c55e 100%)'
              : 'linear-gradient(180deg, #4ade80 0%, #86efac 100%)',
          }}
        />
      </div>
      <span className="text-[9px] font-bold text-muted-foreground uppercase">{month}</span>
    </div>
  );
}

export default function CarbonDashboardPage() {
  const [activeTab, setActiveTab] = React.useState('overview');

  const topDistricts = React.useMemo(() => {
    return [...mockDistricts].sort((a, b) => b.carbonSavedKg - a.carbonSavedKg).slice(0, 12);
  }, []);

  const maxDistrictCarbon = React.useMemo(() => {
    return Math.max(...topDistricts.map(d => d.carbonSavedKg), 1);
  }, [topDistricts]);

  const monthlyData = React.useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data: { month: string; carbon: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      data.push({ month: monthNames[d.getMonth()], carbon: 0 });
    }
    mockDonations.forEach((donation: Donation) => {
      if (donation.carbon_saved_kg && donation.createdAt) {
        const date = (donation.createdAt as any).toDate ? (donation.createdAt as any).toDate() : new Date(donation.createdAt as any);
        const monthName = monthNames[date.getMonth()];
        const entry = data.find(m => m.month === monthName);
        if (entry) entry.carbon += donation.carbon_saved_kg;
      }
    });
    if (data.every(d => d.carbon === 0)) {
      data[0].carbon = 18500; data[1].carbon = 22300; data[2].carbon = 19800;
      data[3].carbon = 25100; data[4].carbon = 21400; data[5].carbon = 28600;
    }
    return data;
  }, []);

  const maxMonthlyCarbon = React.useMemo(() => {
    return Math.max(...monthlyData.map(d => d.carbon), 1);
  }, [monthlyData]);

  const circularStats = React.useMemo(() => {
    const biogasActive = mockBiogasPlants.filter(p => p.operational).length;
    const fertilizerActive = mockFertilizerCentres.filter(c => c.operational).length;
    const totalEnergy = mockBiogasPlants.reduce((acc, p) => acc + p.energyOutputKwh, 0);
    const totalCompost = mockFertilizerCentres.reduce((acc, c) => acc + c.compostOutputKg, 0);
    const totalBiogasCapacity = mockBiogasPlants.reduce((acc, p) => acc + p.capacity, 0);
    const totalFertilizerCapacity = mockFertilizerCentres.reduce((acc, c) => acc + c.capacity, 0);
    return { biogasActive, fertilizerActive, totalEnergy, totalCompost, totalBiogasCapacity, totalFertilizerCapacity };
  }, []);

  const co2Saved = useAnimatedCounter(mockImpactStats.co2Saved, 3000);
  const waterSaved = useAnimatedCounter(mockImpactStats.waterSaved, 3000);
  const treesEquivalent = useAnimatedCounter(mockImpactStats.treesEquivalent, 3000);
  const energySaved = useAnimatedCounter(mockImpactStats.energySaved, 3000);
  const methaneAvoided = useAnimatedCounter(mockImpactStats.methaneAvoided, 3000);

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
        .eco-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(34, 197, 94, 0.08) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
      `}</style>
      <Header title="Carbon Dashboard" />
      <main className="flex-1 pb-20">

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white">
          <div className="absolute inset-0 eco-shimmer opacity-40" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative p-6 md:p-10 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                <Leaf className="h-6 w-6 text-green-300" />
              </div>
              <Badge className="bg-green-400/20 text-green-200 border-green-400/30 text-[10px]">
                Environmental Impact Monitor
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-green-200/80 text-xs font-bold uppercase tracking-widest">Total Carbon Offset</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-7xl font-black tabular-nums tracking-tighter">
                  {co2Saved.toLocaleString()}
                </span>
                <span className="text-lg md:text-xl font-bold text-green-300/80">kg CO₂</span>
              </div>
              <p className="text-xs text-green-200/60 max-w-md">
                Equivalent to planting {treesEquivalent.toLocaleString()} trees or saving {energySaved.toLocaleString()} kWh of energy
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {[
                { icon: Droplets, label: 'Water Saved', value: waterSaved.toLocaleString(), unit: 'L', color: 'text-blue-300' },
                { icon: TreePine, label: 'Trees Equivalent', value: treesEquivalent.toLocaleString(), unit: 'trees', color: 'text-green-300' },
                { icon: Zap, label: 'Energy Saved', value: energySaved.toLocaleString(), unit: 'kWh', color: 'text-yellow-300' },
                { icon: Flame, label: 'Methane Avoided', value: methaneAvoided.toLocaleString(), unit: 'kg', color: 'text-orange-300' },
              ].map((item, i) => (
                <div key={i} className="glass-card rounded-xl p-3 text-white">
                  <item.icon className={`h-4 w-4 ${item.color} mb-1.5`} />
                  <p className="text-[9px] font-bold uppercase tracking-wider text-green-200/60">{item.label}</p>
                  <p className="text-lg font-black tabular-nums">{item.value}</p>
                  <p className="text-[10px] text-green-200/50">{item.unit}</p>
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
              <TabsTrigger value="districts" className="text-[10px] md:text-xs py-2.5">
                <Globe className="h-3.5 w-3.5 mr-1 hidden md:block" /> Districts
              </TabsTrigger>
              <TabsTrigger value="circular" className="text-[10px] md:text-xs py-2.5">
                <Recycle className="h-3.5 w-3.5 mr-1 hidden md:block" /> Circular
              </TabsTrigger>
              <TabsTrigger value="trends" className="text-[10px] md:text-xs py-2.5">
                <TrendingUp className="h-3.5 w-3.5 mr-1 hidden md:block" /> Trends
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
                <CarbonMetricCard icon={Leaf} label="CO₂ Saved" value={mockImpactStats.co2Saved} unit="kg" color="bg-green-500" />
                <CarbonMetricCard icon={Droplets} label="Water Saved" value={mockImpactStats.waterSaved} unit="L" color="bg-blue-500" />
                <CarbonMetricCard icon={TreePine} label="Trees Equivalent" value={mockImpactStats.treesEquivalent} unit="trees" color="bg-emerald-600" />
                <CarbonMetricCard icon={Zap} label="Energy Saved" value={mockImpactStats.energySaved} unit="kWh" color="bg-yellow-500" />
                <CarbonMetricCard icon={Flame} label="Methane Avoided" value={mockImpactStats.methaneAvoided} unit="kg" color="bg-orange-500" />
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      Carbon Offset Breakdown
                    </CardTitle>
                    <CardDescription className="text-xs">Environmental impact of food redistribution</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'CO₂ Emissions Prevented', value: mockImpactStats.co2Saved, max: 400000, color: '#16a34a', icon: Leaf },
                      { label: 'Water Conservation', value: mockImpactStats.waterSaved, max: 8000000, color: '#2563eb', icon: Droplets },
                      { label: 'Tree Planting Equivalent', value: mockImpactStats.treesEquivalent, max: 25000, color: '#059669', icon: TreePine },
                      { label: 'Clean Energy Generated', value: mockImpactStats.energySaved, max: 400000, color: '#d97706', icon: Zap },
                      { label: 'Methane Emissions Avoided', value: mockImpactStats.methaneAvoided, max: 80000, color: '#ea580c', icon: Flame },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <item.icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                            <span className="text-xs font-bold">{item.label}</span>
                          </div>
                          <span className="text-xs font-bold tabular-nums" style={{ color: item.color }}>
                            {item.value.toLocaleString()}
                          </span>
                        </div>
                        <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Impact Gauges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <CircularGauge value={mockImpactStats.co2Saved} max={400000} color="#16a34a"
                        label="CO₂ Target" sublabel="312.5T / 400T" />
                      <CircularGauge value={mockImpactStats.treesEquivalent} max={25000} color="#059669"
                        label="Tree Goal" sublabel="14.5K / 25K" />
                      <CircularGauge value={mockImpactStats.energySaved} max={400000} color="#d97706"
                        label="Energy Goal" sublabel="250K / 400K" />
                      <CircularGauge value={mockImpactStats.waterSaved} max={8000000} color="#2563eb"
                        label="Water Goal" sublabel="5M / 8M" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Quick Stats */}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {[
                  { label: 'Food Rescued', value: `${(mockPlatformAnalytics.totalKgRescued / 1000).toFixed(0)}K kg`, icon: Recycle, color: 'text-green-600 bg-green-50 dark:bg-green-950' },
                  { label: 'Meals Redirected', value: `${(mockPlatformAnalytics.totalBiogasRedirected + mockPlatformAnalytics.totalFertilizerRedirected).toLocaleString()}`, icon: Factory, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
                  { label: 'Biogas Energy', value: `${circularStats.totalEnergy.toLocaleString()} kWh`, icon: Zap, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
                  { label: 'Organic Compost', value: `${circularStats.totalCompost.toLocaleString()} kg`, icon: Leaf, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${stat.color}`}>
                          <stat.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{stat.label}</p>
                          <p className="text-lg font-black tabular-nums">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Districts Tab */}
            <TabsContent value="districts" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    District-Wise Carbon Contribution
                  </h2>
                  <p className="text-xs text-muted-foreground">Top 12 districts by CO₂ offset</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {mockDistricts.length} Districts Active
                </Badge>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-green-600">
                      Carbon Saved by District
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topDistricts.map((district) => (
                      <DistrictBar key={district.id} district={district} maxCarbon={maxDistrictCarbon} />
                    ))}
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider">
                        District Carbon Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[
                          { label: 'Total Districts', value: mockDistricts.length, color: 'text-blue-600' },
                          { label: 'Total CO₂ Saved', value: `${(mockDistricts.reduce((a, d) => a + d.carbonSavedKg, 0) / 1000).toFixed(1)}T`, color: 'text-green-600' },
                          { label: 'Avg per District', value: `${(mockDistricts.reduce((a, d) => a + d.carbonSavedKg, 0) / mockDistricts.length / 1000).toFixed(1)}T`, color: 'text-emerald-600' },
                          { label: 'Total Biogas Centres', value: mockDistricts.reduce((a, d) => a + d.biogasCentres, 0), color: 'text-amber-600' },
                          { label: 'Total Fertilizer Centres', value: mockDistricts.reduce((a, d) => a + d.fertilizerCentres, 0), color: 'text-orange-600' },
                        ].map((stat, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                            <span className="text-xs text-muted-foreground">{stat.label}</span>
                            <span className={`text-sm font-bold tabular-nums ${stat.color}`}>{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                          <Award className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-green-800 dark:text-green-200">Top Performing District</p>
                          <p className="text-lg font-black text-green-700 dark:text-green-300">
                            {topDistricts[0]?.name}
                          </p>
                          <p className="text-[10px] text-green-600/70 dark:text-green-400/70">
                            {(topDistricts[0]?.carbonSavedKg / 1000).toFixed(1)} tonnes CO₂ offset
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Circular Economy Tab */}
            <TabsContent value="circular" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Recycle className="h-5 w-5 text-green-600" />
                    Circular Economy Infrastructure
                  </h2>
                  <p className="text-xs text-muted-foreground">Food waste to resource conversion facilities</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                    <Zap className="h-3 w-3 mr-1" /> {circularStats.biogasActive} Biogas Active
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                    <Recycle className="h-3 w-3 mr-1" /> {circularStats.fertilizerActive} Fertilizer Active
                  </Badge>
                </div>
              </div>

              {/* Circular Economy Flow */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 p-6 text-white">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <RefreshIcon /> Waste-to-Resource Flow
                  </CardTitle>
                  <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                    {[
                      { step: 'Food Waste', icon: Trash2, desc: 'Unsuitable food' },
                      { step: 'Collection', icon: Factory, desc: 'Central pickup' },
                      { step: 'Processing', icon: Recycle, desc: 'Biogas/Compost' },
                      { step: 'Energy', icon: Zap, desc: 'Electricity' },
                      { step: 'Fertilizer', icon: Leaf, desc: 'Organic soil' },
                    ].map((item, i) => (
                      <React.Fragment key={i}>
                        <div className="flex flex-col items-center text-center min-w-[80px]">
                          <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm mb-2">
                            <item.icon className="h-5 w-5" />
                          </div>
                          <p className="text-[10px] font-bold">{item.step}</p>
                          <p className="text-[9px] text-white/60">{item.desc}</p>
                        </div>
                        {i < 4 && <ChevronRight className="h-5 w-5 text-white/40 shrink-0" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Summary Stats */}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {[
                  { label: 'Total Biogas Plants', value: mockBiogasPlants.length, icon: Factory, color: 'bg-green-500' },
                  { label: 'Fertilizer Centres', value: mockFertilizerCentres.length, icon: Recycle, color: 'bg-amber-500' },
                  { label: 'Energy Generated', value: `${circularStats.totalEnergy.toLocaleString()} kWh`, icon: Zap, color: 'bg-blue-500' },
                  { label: 'Compost Produced', value: `${circularStats.totalCompost.toLocaleString()} kg`, icon: Leaf, color: 'bg-emerald-500' },
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className={`p-2 rounded-xl ${stat.color} w-fit mb-2`}>
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{stat.label}</p>
                      <p className="text-lg font-black tabular-nums">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Biogas Plants */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Factory className="h-4 w-4 text-green-600" />
                  Biogas Plants
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockBiogasPlants.map((plant) => (
                    <FacilityCard key={plant.id} facility={plant} type="biogas" />
                  ))}
                </div>
              </div>

              {/* Fertilizer Centres */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Recycle className="h-4 w-4 text-amber-600" />
                  Fertilizer & Composting Centres
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {mockFertilizerCentres.map((centre) => (
                    <FacilityCard key={centre.id} facility={centre} type="fertilizer" />
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Monthly Carbon Trends
                  </h2>
                  <p className="text-xs text-muted-foreground">6-month carbon offset trajectory</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  <TrendingUp className="h-3 w-3 mr-1" /> +18.5% Growth
                </Badge>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider">
                    Monthly CO₂ Offset (kg)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-40 md:h-56">
                    {monthlyData.map((data, i) => (
                      <MonthlyTrendBar key={i} month={data.month} carbon={data.carbon} maxCarbon={maxMonthlyCarbon} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider">Growth Rate</p>
                    </div>
                    <p className="text-3xl font-black text-green-600">+18.5%</p>
                    <p className="text-[10px] text-muted-foreground">Month-over-month carbon offset growth</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <Sun className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider">Peak Month</p>
                    </div>
                    <p className="text-3xl font-black text-blue-600">
                      {monthlyData.reduce((max, d) => d.carbon > max.carbon ? d : max, monthlyData[0]).month}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {Math.max(...monthlyData.map(d => d.carbon)).toLocaleString()} kg CO₂ offset
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                        <Wind className="h-4 w-4 text-amber-600" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider">Avg Monthly</p>
                    </div>
                    <p className="text-3xl font-black text-amber-600">
                      {(monthlyData.reduce((a, d) => a + d.carbon, 0) / monthlyData.length / 1000).toFixed(1)}K
                    </p>
                    <p className="text-[10px] text-muted-foreground">Average kg CO₂ offset per month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Projected Impact */}
              <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/50 dark:to-teal-950/50 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-green-800 dark:text-green-200">2026 Carbon Target Projection</p>
                      <p className="text-xs text-green-600/70 dark:text-green-400/70">
                        At current growth rate, Achayapathra is projected to offset 500+ tonnes of CO₂ by end of 2026,
                        equivalent to planting 25,000 trees or powering 800 homes for a year.
                      </p>
                      <div className="flex gap-4 pt-2">
                        <div>
                          <p className="text-2xl font-black text-green-700 dark:text-green-300">500T+</p>
                          <p className="text-[9px] text-green-600/60 uppercase">Projected CO₂</p>
                        </div>
                        <div>
                          <p className="text-2xl font-black text-green-700 dark:text-green-300">25K</p>
                          <p className="text-[9px] text-green-600/60 uppercase">Tree Equivalent</p>
                        </div>
                        <div>
                          <p className="text-2xl font-black text-green-700 dark:text-green-300">800</p>
                          <p className="text-[9px] text-green-600/60 uppercase">Homes Powered</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="text-center space-y-3 max-w-2xl mx-auto py-8 border-t border-dashed">
            <div className="flex items-center justify-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-black uppercase tracking-tighter">Achayapathra Carbon Initiative</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every meal redistributed prevents food waste and reduces greenhouse gas emissions.
              Our circular economy approach converts unsuitable food into clean energy and organic fertilizer,
              creating a sustainable loop that benefits communities and the planet.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}

function RefreshIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}
