'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, TrendingUp, Map as MapIcon, ShieldAlert, BarChart3, Clock, Loader2, LocateFixed, Zap } from 'lucide-react';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { HungerZone, SystemSettings } from '@/lib/types';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import dynamic from 'next/dynamic';
import { useAdmin } from '@/hooks/useAdmin';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer) as Promise<React.ComponentType<any>>, { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart) as Promise<React.ComponentType<any>>, { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line) as Promise<React.ComponentType<any>>, { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis) as Promise<React.ComponentType<any>>, { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis) as Promise<React.ComponentType<any>>, { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip) as Promise<React.ComponentType<any>>, { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid) as Promise<React.ComponentType<any>>, { ssr: false });

const TAMIL_NADU_STATIC_ZONES = [
  { id: 'tn-1', zone_name: 'Chennai Central', hunger_risk_score: 88, weekly_request_count: 1450, last_30_days_growth_rate: 12.4 },
  { id: 'tn-2', zone_name: 'Coimbatore South', hunger_risk_score: 64, weekly_request_count: 820, last_30_days_growth_rate: 5.2 },
  { id: 'tn-3', zone_name: 'Madurai North', hunger_risk_score: 79, weekly_request_count: 980, last_30_days_growth_rate: 8.7 },
  { id: 'tn-4', zone_name: 'Tiruchirappalli (Trichy)', hunger_risk_score: 52, weekly_request_count: 410, last_30_days_growth_rate: 2.1 },
  { id: 'tn-5', zone_name: 'Salem West', hunger_risk_score: 41, weekly_request_count: 320, last_30_days_growth_rate: -1.5 },
];

const demandData = [
  { day: 'Mon', needed: 450, projected: 480 },
  { day: 'Tue', needed: 520, projected: 510 },
  { day: 'Wed', needed: 480, projected: 550 },
  { day: 'Thu', needed: 610, projected: 590 },
  { day: 'Fri', needed: 550, projected: 620 },
  { day: 'Sat', needed: 700, projected: 750 },
  { day: 'Sun', needed: 680, projected: 720 },
];

export default function FutureIntelligencePage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { isAdmin } = useAdmin();
  
  const zonesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'hunger_zones');
  }, [firestore, user]);
  const { data: dbZones } = useCollection<HungerZone>(zonesQuery);
  
  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'system_settings', 'global');
  }, [firestore, user]);
  const { data: settings, isLoading: settingsLoading } = useDoc<SystemSettings>(settingsRef);

  const handleToggleEmergency = async (checked: boolean) => {
    if (!settingsRef || !firestore || !isAdmin) return;
    
    await setDoc(settingsRef, {
      emergencyMode: checked,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  };

  const displayZones = React.useMemo(() => {
    if (dbZones && dbZones.length > 0) return dbZones;
    return TAMIL_NADU_STATIC_ZONES;
  }, [dbZones]);

  return (
    <>
      <Header title="Future Intelligence" />
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        
        {/* Emergency Mode Control Panel */}
        <Card className={settings?.emergencyMode ? "border-destructive bg-destructive/5 ring-2 ring-destructive/20" : "border-primary/20 shadow-md"}>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-xl font-headline">
                <Zap className={settings?.emergencyMode ? "text-destructive animate-pulse" : "text-primary"} />
                Emergency Redistribution Mode
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                {settings?.emergencyMode 
                  ? "Achayapathra is currently operating as a rapid hunger response network. Urgency weights are increased by 50%."
                  : "Emergency Mode enables Achayapathra to transform into a rapid hunger response network during crisis situations."}
              </CardDescription>
            </div>
            {isAdmin && (
              <div className="flex items-center space-x-3 bg-background p-3 rounded-xl border-2 shadow-sm">
                {settingsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Switch 
                      id="emergency-mode" 
                      checked={settings?.emergencyMode || false}
                      onCheckedChange={handleToggleEmergency}
                    />
                    <Label htmlFor="emergency-mode" className="font-bold text-sm tracking-tight">ACTIVATE CRISIS MODE</Label>
                  </>
                )}
              </div>
            )}
          </CardHeader>
          {settings?.emergencyMode && (
             <CardContent className="pt-0">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-center">
                    <p className="text-[10px] font-bold text-destructive uppercase">Urgency Weight</p>
                    <p className="text-lg font-black text-destructive">+50%</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-center">
                    <p className="text-[10px] font-bold text-destructive uppercase">Radius Expansion</p>
                    <p className="text-lg font-black text-destructive">Max</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-center">
                    <p className="text-[10px] font-bold text-destructive uppercase">Wait Time</p>
                    <p className="text-lg font-black text-destructive">-75%</p>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-center">
                    <p className="text-[10px] font-bold text-destructive uppercase">Priority Zone</p>
                    <p className="text-lg font-black text-destructive">High Risk</p>
                  </div>
               </div>
             </CardContent>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Hunger Heatmap Analysis - Tamil Nadu Region */}
          <Card className="lg:col-span-2 flex flex-col border-none shadow-sm bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapIcon className="h-5 w-5 text-primary" />
                  AI Hunger Heatmap: Tamil Nadu
                </CardTitle>
                <CardDescription>Real-time risk scoring across urban zones in TN.</CardDescription>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1 font-bold">
                <LocateFixed className="h-3 w-3" />
                South India Region
              </Badge>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                {displayZones.map(zone => (
                  <div key={zone.id} className="space-y-3 p-5 rounded-2xl border bg-background hover:border-primary/50 transition-all duration-300">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-lg font-black font-headline tracking-tight">{zone.zone_name}</span>
                      <Badge variant={zone.hunger_risk_score > 70 ? "destructive" : zone.hunger_risk_score > 50 ? "default" : "outline"} className="px-3 py-1 font-black">
                        RISK: {zone.hunger_risk_score}
                      </Badge>
                    </div>
                    <Progress value={zone.hunger_risk_score} className="h-2.5" />
                    <div className="flex flex-wrap gap-6 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className={zone.last_30_days_growth_rate > 0 ? "h-3.5 w-3.5 text-destructive" : "h-3.5 w-3.5 text-green-600"} /> 
                        Growth: {zone.last_30_days_growth_rate > 0 ? '+' : ''}{zone.last_30_days_growth_rate}%
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Weekly Request: {zone.weekly_request_count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Predictive Demand */}
          <div className="lg:col-span-1 space-y-6 flex flex-col">
            <Card className="flex-1 flex flex-col border-none shadow-sm bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  7-Day Projection
                </CardTitle>
                <CardDescription>Predicted vs Actual regional requirement.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 flex-1">
                <div className="flex-1 min-h-[300px] w-full bg-muted/20 rounded-2xl p-4 border border-dashed relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={demandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="projected" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="needed" stroke="hsl(var(--muted-foreground))" strokeDasharray="6 6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/20 shadow-inner mt-4">
                  <p className="text-5xl font-black text-primary tracking-tighter">+12.4%</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">Regional Volatility Index</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Crisis Response Tracking - Only visible during emergencies */}
          {settings?.emergencyMode && (
            <Card className="lg:col-span-3 border-destructive/30 bg-destructive/5 overflow-hidden">
               <CardHeader className="bg-destructive text-white py-3">
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    Live Crisis Response Dashboard
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                  <div className="grid gap-6 md:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Emergency Meals</p>
                      <p className="text-3xl font-black text-destructive">1,245</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Response Time</p>
                      <p className="text-3xl font-black text-destructive">8.4m</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Responders</p>
                      <p className="text-3xl font-black text-destructive">84</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Zones Mitigated</p>
                      <p className="text-3xl font-black text-destructive">12</p>
                    </div>
                  </div>
               </CardContent>
            </Card>
          )}

          {/* Transparency & Traceability */}
          <Card className="lg:col-span-3 border-none shadow-sm bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-headline">
                <BarChart3 className="h-5 w-5 text-primary" />
                Transparency & Traceability Logs
              </CardTitle>
              <CardDescription>Real-time digital audit trail of the food redistribution chain.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="p-8 rounded-3xl border bg-background shadow-sm flex flex-col items-center text-center group hover:border-primary/50 transition-all">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Avg Matching Time</p>
                  <p className="text-5xl font-black text-primary tracking-tighter group-hover:scale-110 transition-transform">14.2m</p>
                  <p className="text-[10px] font-bold text-green-600 mt-4 bg-green-100 px-4 py-1.5 rounded-full">↓ 2.1m Optimisation</p>
                </div>
                <div className="p-8 rounded-3xl border bg-background shadow-sm flex flex-col items-center text-center group hover:border-primary/50 transition-all">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Matching Efficiency</p>
                  <p className="text-5xl font-black text-primary tracking-tighter group-hover:scale-110 transition-transform">94.8%</p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-4 bg-muted px-4 py-1.5 rounded-full">AI Confidence Score</p>
                </div>
                <div className="p-8 rounded-3xl border bg-background shadow-sm flex flex-col items-center text-center group hover:border-primary/50 transition-all">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Carbon Offset (CO₂)</p>
                  <p className="text-5xl font-black text-primary tracking-tighter group-hover:scale-110 transition-transform">4.8T</p>
                  <p className="text-[10px] font-bold text-primary mt-4 bg-primary/10 px-4 py-1.5 rounded-full">Environmental Rescue</p>
                </div>
              </div>
              <div className="mt-8 p-6 rounded-3xl border-2 border-dashed bg-muted/5 text-center">
                <p className="text-xs font-headline text-muted-foreground italic flex items-center justify-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  "System Integrity: Blockchain-backed digital twin audit active for regional nodes."
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </>
  );
}
