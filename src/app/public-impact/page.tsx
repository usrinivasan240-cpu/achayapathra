'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Globe,
  Users,
  Leaf,
  MapPin,
  TrendingUp,
  Clock,
  Award,
  Star,
  Zap,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Droplets,
  TreePine,
  Flame,
} from 'lucide-react';
import { mockImpactStats, mockCities } from '@/lib/data';

function useAnimatedCounter(target: number, duration = 2000) {
  const [count, setCount] = React.useState(0);
  const [started, setStarted] = React.useState(false);

  const start = React.useCallback(() => setStarted(true), []);

  React.useEffect(() => {
    if (!started || target === 0) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return { count, start };
}

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.2) {
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}

export default function PublicImpactPage() {
  const [activeMessageIndex, setActiveMessageIndex] = React.useState(0);
  const [deathsToday, setDeathsToday] = React.useState(0);

  const emotionalMessages = [
    'Every minute matters. Every meal counts.',
    'Surplus food can save lives — together we make it happen.',
    'Data-driven redistribution is ending hunger, one delivery at a time.',
    'Your compassion builds humanity. Join the movement today.',
    'Small acts of kindness create giant impacts across communities.',
    'No one should sleep hungry when food is being wasted elsewhere.',
  ];

  const milestones = [
    { year: '2022', title: 'Achayapathra Founded', description: 'Platform launched in Tamil Nadu with 5 NGO partners.', icon: Star },
    { year: '2023', title: '10,000 Meals Milestone', description: 'Crossed 10,000 meals redistributed across 5 cities.', icon: Award },
    { year: '2024', title: 'AI Matching Live', description: 'Introduced AI-powered smart matching for instant donation-need pairing.', icon: Zap },
    { year: '2025', title: '100,000 Meals Served', description: 'Expanded to 20 cities with 50+ verified NGO partners.', icon: TrendingUp },
    { year: '2026', title: '285,000+ Meals & Growing', description: 'Covering 30 cities, 87 NGOs, and 650+ active volunteers.', icon: Heart },
  ];

  const deathsPerMinute = 1.52;
  const estimatedDailyTotal = 2191;

  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const minutesPassed = (now.getTime() - startOfDay.getTime()) / 60000;
      setDeathsToday(Math.floor(minutesPassed * deathsPerMinute));
    }, 1000);

    const messageInterval = setInterval(() => {
      setActiveMessageIndex((prev) => (prev + 1) % emotionalMessages.length);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, []);

  const heroRef = React.useRef<HTMLDivElement>(null);
  const metricsRef = React.useRef<HTMLDivElement>(null);
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const citiesRef = React.useRef<HTMLDivElement>(null);
  const hungerRef = React.useRef<HTMLDivElement>(null);

  const metricsInView = useInView(metricsRef);
  const timelineInView = useInView(timelineRef);
  const citiesInView = useInView(citiesRef);
  const hungerInView = useInView(hungerRef);

  const mealsCounter = useAnimatedCounter(mockImpactStats.mealsServed, 2500);
  const peopleCounter = useAnimatedCounter(mockImpactStats.peopleServed, 2500);
  const co2Counter = useAnimatedCounter(mockImpactStats.co2Saved, 2500);
  const ngoCounter = useAnimatedCounter(mockImpactStats.verifiedNGOs, 2000);
  const volunteerCounter = useAnimatedCounter(mockImpactStats.activeVolunteers, 2000);
  const citiesCounter = useAnimatedCounter(mockImpactStats.citiesCovered, 2000);
  const waterCounter = useAnimatedCounter(mockImpactStats.waterSaved, 2500);
  const treesCounter = useAnimatedCounter(mockImpactStats.treesEquivalent, 2000);

  React.useEffect(() => {
    if (metricsInView) {
      mealsCounter.start();
      peopleCounter.start();
      co2Counter.start();
      ngoCounter.start();
      volunteerCounter.start();
      citiesCounter.start();
      waterCounter.start();
      treesCounter.start();
    }
  }, [metricsInView]);

  const topCities = [...mockCities].sort((a, b) => b.impact - a.impact).slice(0, 10);
  const maxImpact = topCities[0]?.impact ?? 1;

  const hungerProgress = Math.min((deathsToday / estimatedDailyTotal) * 100, 100);

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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s ease-out forwards;
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
          50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.6); }
        }
        .animate-pulse-glow {
          animation: pulseGlow 3s ease-in-out infinite;
        }
        @keyframes countUp {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-count-up {
          animation: countUp 0.5s ease-out forwards;
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }
        .parallax-hero {
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
        }
        @media (max-width: 768px) {
          .parallax-hero {
            background-attachment: scroll;
          }
        }
      `}</style>

      <div className="min-h-screen bg-background">
        {/* HERO SECTION */}
        <div
          ref={heroRef}
          className="parallax-hero relative h-[100vh] min-h-[600px] w-full overflow-hidden"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-primary/30" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-sm animate-fade-in-up text-xs px-4 py-1.5">
              Public Impact Dashboard
            </Badge>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-headline text-white tracking-tighter uppercase leading-none mb-4 animate-fade-in-up">
              Achayapathra
            </h1>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-primary tracking-tight uppercase mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              Impact Report
            </h2>

            <div className="bg-primary/90 backdrop-blur-sm px-6 py-3 rounded-full text-white font-bold text-sm md:text-base animate-pulse-glow max-w-lg animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {emotionalMessages[activeMessageIndex]}
            </div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <p className="text-3xl md:text-4xl font-black text-white">{mockImpactStats.mealsServed.toLocaleString()}</p>
                <p className="text-[10px] md:text-xs text-white/70 font-bold uppercase tracking-wider mt-1">Meals Served</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <p className="text-3xl md:text-4xl font-black text-white">{mockImpactStats.peopleServed.toLocaleString()}</p>
                <p className="text-[10px] md:text-xs text-white/70 font-bold uppercase tracking-wider mt-1">People Fed</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20 col-span-2 md:col-span-1">
                <p className="text-3xl md:text-4xl font-black text-white">{mockImpactStats.co2Saved.toLocaleString()}</p>
                <p className="text-[10px] md:text-xs text-white/70 font-bold uppercase tracking-wider mt-1">KG CO₂ Saved</p>
              </div>
            </div>

            <div className="mt-10 animate-bounce">
              <ChevronDown className="h-8 w-8 text-white/60" />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="p-4 md:p-8 lg:p-12 space-y-12 md:space-y-16 max-w-7xl mx-auto">

          {/* ANIMATED IMPACT COUNTERS */}
          <div ref={metricsRef}>
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">
                <Zap className="h-3 w-3 mr-1" />
                Live Counters
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase">
                Real-Time <span className="text-primary">Impact</span>
              </h2>
              <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-xl mx-auto">
                Numbers that represent lives touched, communities strengthened, and a planet protected.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {[
                { label: 'Meals Served', value: mealsCounter.count, icon: Heart, color: 'text-primary', bg: 'bg-primary/5 border-primary/20' },
                { label: 'People Fed', value: peopleCounter.count, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                { label: 'CO₂ Saved (KG)', value: co2Counter.count, icon: Leaf, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
                { label: 'NGOs Active', value: ngoCounter.count, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
                { label: 'Volunteers', value: volunteerCounter.count, icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
                { label: 'Cities Covered', value: citiesCounter.count, icon: MapPin, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
              ].map((item) => (
                <Card key={item.label} className={`${item.bg} border text-center animate-fade-in-up hover:scale-105 transition-transform duration-300`}>
                  <CardContent className="pt-6 pb-4">
                    <item.icon className={`h-6 w-6 ${item.color} mx-auto mb-2`} />
                    <p className={`text-2xl md:text-3xl font-black ${item.color} animate-count-up tabular-nums`}>
                      {item.value.toLocaleString()}
                    </p>
                    <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                      {item.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Water Saved (L)', value: waterCounter.count, icon: Droplets, color: 'text-cyan-600' },
                { label: 'Trees Equivalent', value: treesCounter.count, icon: TreePine, color: 'text-emerald-600' },
                { label: 'Days Active', value: mockImpactStats.daysActive, icon: Flame, color: 'text-orange-600' },
                { label: 'Districts', value: mockImpactStats.districtsCovered, icon: MapPin, color: 'text-indigo-600' },
              ].map((item) => (
                <Card key={item.label} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-3">
                    <item.icon className={`h-5 w-5 ${item.color} mx-auto mb-1`} />
                    <p className={`text-xl md:text-2xl font-black ${item.color} tabular-nums`}>
                      {item.value.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* IMPACT TIMELINE */}
          <div ref={timelineRef}>
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">
                <Clock className="h-3 w-3 mr-1" />
                Our Journey
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase">
                Impact <span className="text-primary">Timeline</span>
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2" />

              <div className="space-y-8 md:space-y-12">
                {milestones.map((milestone, index) => {
                  const Icon = milestone.icon;
                  const isLeft = index % 2 === 0;
                  return (
                    <div
                      key={milestone.year}
                      className={`relative flex items-center ${
                        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                      } flex-row`}
                    >
                      <div className={`hidden md:block w-1/2 ${isLeft ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                        {timelineInView && (
                          <div className={isLeft ? 'animate-slide-in-left' : 'animate-slide-in-right'} style={{ animationDelay: `${index * 0.15}s` }}>
                            <Badge className="mb-2 bg-primary text-primary-foreground">{milestone.year}</Badge>
                            <h3 className="text-lg md:text-xl font-black">{milestone.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                          </div>
                        )}
                      </div>

                      <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: `${index * 0.3}s` }}>
                          <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                        </div>
                      </div>

                      <div className="md:hidden pl-12 w-full">
                        {timelineInView && (
                          <div className="animate-fade-in-up" style={{ animationDelay: `${index * 0.15}s` }}>
                            <Badge className="mb-2 bg-primary text-primary-foreground">{milestone.year}</Badge>
                            <h3 className="text-base font-black">{milestone.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                          </div>
                        )}
                      </div>

                      <div className="hidden md:block w-1/2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CITY-WISE IMPACT RANKING */}
          <div ref={citiesRef}>
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-3 text-primary border-primary/30">
                <MapPin className="h-3 w-3 mr-1" />
                Geographic Reach
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase">
                City-Wise <span className="text-primary">Ranking</span>
              </h2>
              <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-xl mx-auto">
                Tamil Nadu cities leading the fight against hunger through Achayapathra.
              </p>
            </div>

            <div className="grid gap-3 md:gap-4">
              {topCities.map((city, index) => {
                const percentage = (city.impact / maxImpact) * 100;
                return (
                  <Card
                    key={city.name}
                    className={`hover:shadow-md transition-all duration-300 ${
                      citiesInView ? 'animate-fade-in-up' : 'opacity-0'
                    } ${index === 0 ? 'border-primary/40 bg-primary/5' : ''}`}
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-sm md:text-base shrink-0 ${
                          index === 0 ? 'bg-primary text-white' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          #{index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className="font-black text-sm md:text-base flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                              {city.name}
                            </h3>
                            <span className="text-xs md:text-sm font-bold text-primary tabular-nums">
                              {city.impact.toLocaleString()} meals
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2 md:h-2.5" />
                          <div className="flex items-center gap-4 mt-1.5 text-[10px] md:text-[11px] text-muted-foreground font-semibold">
                            <span>{city.rescued.toLocaleString()} KG rescued</span>
                            <span>{city.ngos} NGOs</span>
                            <span>{city.volunteers} volunteers</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* HUNGER RISK AWARENESS */}
          <div ref={hungerRef}>
            <div className="text-center mb-10">
              <Badge variant="destructive" className="mb-3">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Awareness
              </Badge>
              <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase">
                Hunger Risk <span className="text-destructive">Reality</span>
              </h2>
              <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-xl mx-auto">
                The crisis is real. Every minute counts. Here is what the data tells us.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Deaths Tracker */}
              <Card className="border-destructive/30 bg-destructive/5 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-wider text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Estimated Malnutrition-Related Child Deaths (India)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative h-40 md:h-48 flex flex-col items-center justify-center bg-destructive/5 rounded-xl overflow-hidden border border-destructive/20 shadow-inner">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-destructive rounded-full animate-drip z-0 blur-[1px]" />
                    <div className="absolute top-4 left-1/3 w-2 h-2 bg-destructive rounded-full animate-drip z-0 blur-[1px] delay-700" />
                    <div className="absolute top-2 right-1/4 w-3 h-3 bg-destructive rounded-full animate-drip z-0 blur-[1px] delay-300" />

                    <div
                      className="absolute bottom-0 left-0 w-full bg-destructive/25 transition-all duration-1000 ease-linear z-10"
                      style={{ height: `${Math.max(5, hungerProgress)}%` }}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-destructive/40 blur-[2px]" />
                    </div>

                    <div className="z-20 flex flex-col items-center px-4">
                      <span className="text-5xl md:text-6xl font-black text-destructive tabular-nums tracking-tighter drop-shadow-sm">
                        ~{deathsToday.toLocaleString()}
                      </span>
                      <span className="text-[10px] md:text-xs font-bold uppercase text-destructive/80 tracking-widest mt-1 bg-white/40 px-3 py-0.5 rounded text-center">
                        Accumulated Today
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <p className="text-[10px] leading-relaxed font-medium text-destructive/80 italic">
                      Disclaimer: Data is based on publicly available global health estimates. Not official real-time statistics.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Rate: ~1.52 / min
                    </div>
                    <div className="text-destructive">
                      {hungerProgress.toFixed(1)}% of daily projection
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Call to Action */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    How You Can Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {[
                      { icon: Heart, title: 'Donate Food', desc: 'Share surplus food with those in need. Every meal matters.', color: 'text-primary' },
                      { icon: Users, title: 'Volunteer', desc: 'Join our delivery network and help redistribute food in your city.', color: 'text-blue-600' },
                      { icon: Globe, title: 'Spread the Word', desc: 'Share our mission on social media and inspire your community.', color: 'text-green-600' },
                      { icon: ShieldCheck, title: 'Partner as NGO', desc: 'Register your organization and connect with donors instantly.', color: 'text-purple-600' },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-background border`}>
                          <item.icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{item.title}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button className="flex-1 font-bold" asChild>
                      <Link href="/signup">
                        Get Involved
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="flex-1 font-bold" asChild>
                      <Link href="/signup">
                        Register as NGO
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* BOTTOM CTA */}
          <div className="text-center space-y-6 max-w-3xl mx-auto py-12 md:py-16 border-t border-dashed">
            <div className="inline-flex items-center gap-2 text-primary">
              <Heart className="h-5 w-5 animate-pulse" />
              <span className="font-bold text-sm uppercase tracking-wider">Building Humanity Through Sharing</span>
              <Heart className="h-5 w-5 animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase">
              Be Part of the <span className="text-primary">Change</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
              Achayapathra utilizes real-time tracking and AI matching to ensure every gram of surplus food
              reaches those who need it most. Join thousands of donors, volunteers, and NGOs building a
              hunger-free Tamil Nadu.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="font-bold px-8" asChild>
                <Link href="/signup">
                  Start Donating
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-bold px-8" asChild>
                <Link href="/signup">
                  Join as Volunteer
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 pt-4 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                {mockImpactStats.verifiedNGOs} Verified NGOs
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                {mockImpactStats.activeVolunteers} Volunteers
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-rose-600" />
                {mockImpactStats.citiesCovered} Cities
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
