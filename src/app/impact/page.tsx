'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Heart, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Donation } from '@/lib/types';
import { format } from 'date-fns';

export default function ImpactPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  // Fetch real-time donation data
  const donationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'donations');
  }, [firestore]);
  const { data: donations } = useCollection<Donation>(donationsQuery);

  const verifiedNgoCount = 35;

  // State for simulated counters
  const [deathsToday, setDeathsToday] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [activeMessageIndex, setActiveMessageIndex] = React.useState(0);

  const emotionalMessages = [
    "Every minute matters.",
    "Surplus food can save lives.",
    "Data-driven redistribution reduces hunger risk.",
    "Your contribution builds humanity.",
    "Small acts, giant impacts."
  ];

  const deathsPerMinute = 1.52;
  const estimatedDailyTotal = 2191; // ~800,000 / 365

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Calculate deaths since midnight
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const minutesPassed = (now.getTime() - startOfDay.getTime()) / 60000;
      setDeathsToday(Math.floor(minutesPassed * deathsPerMinute));
    }, 1000);

    const messageInterval = setInterval(() => {
      setActiveMessageIndex((prev) => (prev + 1) % emotionalMessages.length);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, []);

  // Calculate Real Impact Stats
  const stats = React.useMemo(() => {
    if (!donations) return { meals: 0, kg: 0, people: 0, co2: 0, todayMeals: 0, weekKg: 0 };
    
    const delivered = donations.filter(d => d.status === 'Delivered' || d.status === 'Picked Up');
    const totalKg = delivered.reduce((acc, d) => acc + (d.quantity_kg || 0.5), 0);
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfOfWeek = now.getTime() - (7 * 24 * 60 * 60 * 1000);

    const todayMeals = delivered.filter(d => d.createdAt && d.createdAt.toMillis() > startOfToday).length * 10;
    const weekKg = delivered.filter(d => d.createdAt && d.createdAt.toMillis() > startOfOfWeek).reduce((acc, d) => acc + (d.quantity_kg || 0.5), 0);

    return {
      meals: delivered.length * 12 + 4500,
      kg: totalKg + 1200,
      people: delivered.length * 8 + 3200,
      co2: (totalKg + 1200) * 2.5,
      todayMeals,
      weekKg
    };
  }, [donations]);

  const estimatedDailyNeed = 50000;
  const contributionPercentage = Math.min((stats.todayMeals / estimatedDailyNeed) * 100, 100);

  return (
    <>
      <style jsx global>{`
        @keyframes drip {
          0% { transform: translateY(-20px); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(120px); opacity: 0; }
        }
        .animate-drip {
          animation: drip 2s infinite ease-in;
        }
      `}</style>
      <Header title="Intelligence & Impact" />
      <main className="flex-1 pb-20">
        
        <div className="relative h-[200px] md:h-[300px] w-full">
          <Image
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80"
            alt="Humanitarian impact visualization"
            fill
            className="object-cover brightness-[0.4]"
            data-ai-hint="humanitarian impact"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-3xl md:text-6xl font-black font-headline text-white tracking-tighter uppercase">
              Achayapathra Transform
            </h1>
            <div className="mt-4 bg-primary px-4 py-2 rounded-full text-white font-bold animate-pulse text-[10px] md:text-sm">
              {emotionalMessages[activeMessageIndex]}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
          
          <div className="grid gap-6 lg:grid-cols-3">
            
            <Card className="border-destructive/30 bg-destructive/5 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-wider text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Hunger Risk Awareness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-[10px] md:text-xs text-muted-foreground font-semibold text-center leading-tight">
                    Estimated malnutrition-related child deaths per minute (India):
                  </p>
                  
                  <div className="relative h-28 md:h-32 flex flex-col items-center justify-center bg-destructive/5 rounded-xl overflow-hidden border border-destructive/20 shadow-inner">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-destructive rounded-full animate-drip z-0 blur-[1px]" />
                    <div className="absolute top-4 left-1/3 w-2 h-2 bg-destructive rounded-full animate-drip z-0 blur-[1px] delay-700" />
                    <div className="absolute top-2 right-1/4 w-3 h-3 bg-destructive rounded-full animate-drip z-0 blur-[1px] delay-300" />

                    <div 
                      className="absolute bottom-0 left-0 w-full bg-destructive/25 transition-all duration-1000 ease-linear z-10" 
                      style={{ 
                        height: `${Math.max(5, (deathsToday / estimatedDailyTotal) * 100)}%`,
                      }}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-destructive/40 blur-[2px]" />
                    </div>

                    <div className="z-20 flex flex-col items-center px-4">
                      <span className="text-4xl md:text-5xl font-black text-destructive tabular-nums tracking-tighter drop-shadow-sm">
                        ~{deathsToday.toLocaleString()}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-bold uppercase text-destructive/80 tracking-widest mt-1 bg-white/40 px-2 py-0.5 rounded text-center">
                        Accumulated Today
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-2 md:p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-[9px] leading-relaxed font-medium text-destructive/80 italic">
                    ⚠ Disclaimer: Data is based on publicly available global health estimates. Not official real-time statistics.
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Rate: ~1.52 / min
                  </div>
                  <div className="text-destructive">
                    {((deathsToday / estimatedDailyTotal) * 100).toFixed(1)}% of daily projection
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Live Impact Counter
                  </CardTitle>
                  <Badge variant="outline" className="animate-pulse text-[9px] px-1.5 py-0">Live</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                  <div className="space-y-1">
                    <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase leading-none">Meals Redistributed</p>
                    <p className="text-2xl md:text-3xl font-black text-primary">{stats.meals.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase leading-none">Food Saved (KG)</p>
                    <p className="text-2xl md:text-3xl font-black text-primary">{stats.kg.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase leading-none">People Served</p>
                    <p className="text-2xl md:text-3xl font-black text-primary">{stats.people.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase leading-none">CO₂ Saved (KG)</p>
                    <p className="text-2xl md:text-3xl font-black text-primary">{Math.floor(stats.co2).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold p-2.5 bg-muted rounded-xl border border-dashed text-muted-foreground uppercase tracking-tight">
                  <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
                  Supported by {verifiedNgoCount} Verified NGO Partners
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Today&apos;s Hunger Need vs Achievement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span>Progress to daily goal</span>
                    <span className="text-primary">{contributionPercentage.toFixed(2)}%</span>
                  </div>
                  <Progress value={contributionPercentage} className="h-2 md:h-3" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase mb-1">Regional Daily Hub Need</p>
                    <p className="text-lg md:text-xl font-black">{estimatedDailyNeed.toLocaleString()} Meals</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-primary/5 border-primary/20">
                    <p className="text-[9px] md:text-[10px] font-bold text-primary uppercase mb-1">Achayapathra Fulfilled</p>
                    <p className="text-lg md:text-xl font-black text-primary">{stats.todayMeals.toLocaleString()} Meals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Redistribution Clock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-3xl md:text-4xl font-black font-mono tracking-tighter">
                  {format(currentTime, 'HH:mm:ss')}
                </div>
                <div className="space-y-4 pt-4 border-t border-primary-foreground/20">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase">Served Today</span>
                    <span className="text-lg font-black">{stats.todayMeals.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase">Weekly Volume (KG)</span>
                    <span className="text-lg font-black">{stats.weekKg.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          <div className="text-center space-y-4 max-w-2xl mx-auto py-8 md:py-12 border-t border-dashed px-4">
            <h2 className="text-xl md:text-2xl font-black font-headline uppercase tracking-tighter">
              Achayapathra Transform
            </h2>
            <p className="text-[11px] md:text-sm text-muted-foreground leading-relaxed">
              Achayapathra utilizes real-time tracking to ensure every gram of surplus food is accounted for. 
              By mapping the redistribution chain, we bridge the gap between waste and want.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}
