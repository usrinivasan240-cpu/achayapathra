'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  Shield,
  Users,
  MapPin,
  Clock,
  Phone,
  Radio,
  Siren,
  Activity,
  Zap,
  Megaphone,
  Droplets,
  Wind,
  Sun,
  Mountain,
  Bug,
  Flame,
  Factory,
  Plus,
  XCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Send,
  Eye,
  Filter,
  BarChart3,
  TrendingUp,
  HeartHandshake,
} from 'lucide-react';
import { mockEmergencyEvents } from '@/lib/data';
import { EmergencyEvent } from '@/lib/types';

const EMERGENCY_TYPE_CONFIG: Record<
  EmergencyEvent['type'],
  { icon: React.ElementType; label: string; color: string; bg: string }
> = {
  flood: { icon: Droplets, label: 'Flood', color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/30' },
  cyclone: { icon: Wind, label: 'Cyclone', color: 'text-purple-600', bg: 'bg-purple-500/10 border-purple-500/30' },
  drought: { icon: Sun, label: 'Drought', color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-500/30' },
  earthquake: { icon: Mountain, label: 'Earthquake', color: 'text-stone-600', bg: 'bg-stone-500/10 border-stone-500/30' },
  pandemic: { icon: Bug, label: 'Pandemic', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  fire: { icon: Flame, label: 'Fire', color: 'text-red-600', bg: 'bg-red-500/10 border-red-500/30' },
  industrial: { icon: Factory, label: 'Industrial', color: 'text-orange-600', bg: 'bg-orange-500/10 border-orange-500/30' },
};

const SEVERITY_CONFIG: Record<
  EmergencyEvent['severity'],
  { label: string; color: string; bg: string; border: string; pulse: string }
> = {
  low: { label: 'Low', color: 'text-green-700', bg: 'bg-green-500/10', border: 'border-green-500/30', pulse: '' },
  medium: { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', pulse: '' },
  high: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/30', pulse: 'animate-pulse' },
  critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/30', pulse: 'animate-pulse' },
};

const STATUS_CONFIG: Record<EmergencyEvent['status'], { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Active', color: 'bg-red-500 text-white', icon: Siren },
  contained: { label: 'Contained', color: 'bg-amber-500 text-white', icon: Shield },
  resolved: { label: 'Resolved', color: 'bg-green-500 text-white', icon: CheckCircle2 },
};

function formatTimestamp(timestamp: any): string {
  if (!timestamp) return 'Unknown';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TimeAgo({ timestamp }: { timestamp: any }) {
  const [text, setText] = React.useState('');
  React.useEffect(() => {
    const update = () => {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      const diff = Date.now() - date.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) setText(`${mins}m ago`);
      else if (mins < 1440) setText(`${Math.floor(mins / 60)}h ago`);
      else setText(`${Math.floor(mins / 1440)}d ago`);
    };
    update();
    const i = setInterval(update, 60000);
    return () => clearInterval(i);
  }, [timestamp]);
  return <span>{text}</span>;
}

export default function EmergencyResponsePage() {
  const [events] = React.useState<EmergencyEvent[]>(mockEmergencyEvents);
  const [selectedType, setSelectedType] = React.useState<EmergencyEvent['type'] | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = React.useState<EmergencyEvent['severity'] | 'all'>('all');
  const [expandedCard, setExpandedCard] = React.useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const [newEvent, setNewEvent] = React.useState({
    type: 'flood' as EmergencyEvent['type'],
    title: '',
    description: '',
    district: '',
    severity: 'high' as EmergencyEvent['severity'],
    affectedPopulation: '',
    mealsRequired: '',
  });

  const activeEvents = React.useMemo(() => events.filter((e) => e.status === 'active'), [events]);
  const filteredEvents = React.useMemo(() => {
    return events.filter((e) => {
      if (selectedType !== 'all' && e.type !== selectedType) return false;
      if (selectedSeverity !== 'all' && e.severity !== selectedSeverity) return false;
      return true;
    });
  }, [events, selectedType, selectedSeverity]);

  const totals = React.useMemo(() => {
    const active = activeEvents;
    return {
      mealsRequired: active.reduce((s, e) => s + e.mealsRequired, 0),
      mealsDelivered: active.reduce((s, e) => s + e.mealsDelivered, 0),
      volunteers: active.reduce((s, e) => s + e.activeVolunteers, 0),
      ngos: active.reduce((s, e) => s + e.activeNGOs, 0),
      affected: active.reduce((s, e) => s + e.affectedPopulation, 0),
    };
  }, [activeEvents]);

  const deliveryRate = totals.mealsRequired > 0
    ? Math.round((totals.mealsDelivered / totals.mealsRequired) * 100)
    : 0;

  const criticalCount = activeEvents.filter((e) => e.severity === 'critical').length;
  const highCount = activeEvents.filter((e) => e.severity === 'high').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setShowCreateForm(false);
        setSubmitted(false);
        setNewEvent({ type: 'flood', title: '', description: '', district: '', severity: 'high', affectedPopulation: '', mealsRequired: '' });
      }, 2000);
    }, 1500);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes siren-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes glow-red {
          0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.3); }
          50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.2); }
        }
        .animate-siren { animation: siren-pulse 1.5s ease-in-out infinite; }
        .animate-glow-red { animation: glow-red 2s ease-in-out infinite; }
        .severity-critical-card { animation: glow-red 2s ease-in-out infinite; }
      `}</style>

      <Header title="Emergency Response Centre" />
      <main className="flex-1 pb-20">
        <div className="relative h-[180px] md:h-[260px] w-full overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-orange-900">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05_4px)]" />
          </div>
          <div className="absolute top-4 right-4 md:top-8 md:right-8">
            <div className="flex items-center gap-2 bg-red-600/80 backdrop-blur-sm px-3 py-1.5 rounded-full animate-siren">
              <Siren className="h-4 w-4 text-white" />
              <span className="text-white text-xs font-bold uppercase tracking-wider">Live Emergency Mode</span>
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-10">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl mb-3">
              <AlertTriangle className="h-8 w-8 md:h-12 md:w-12 text-red-300 animate-siren" />
            </div>
            <h1 className="text-2xl md:text-5xl font-black font-headline text-white tracking-tighter uppercase">
              Emergency Response Centre
            </h1>
            <p className="mt-2 text-red-200 text-xs md:text-sm font-medium max-w-xl">
              Coordinating food redistribution across {activeEvents.length} active emergencies in Tamil Nadu
            </p>
            {criticalCount > 0 && (
              <div className="mt-3 bg-red-600 px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                <Zap className="h-3 w-3 fill-white text-white" />
                <span className="text-white text-[10px] md:text-xs font-bold">
                  {criticalCount} CRITICAL {criticalCount > 1 ? 'EVENTS' : 'EVENT'} REQUIRE IMMEDIATE ACTION
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-6 md:space-y-8">

          {activeEvents.length > 0 && (
            <Alert className="border-red-500/50 bg-red-500/5 animate-glow-red">
              <Radio className="h-4 w-4 text-red-500 animate-siren" />
              <AlertTitle className="text-red-700 font-bold text-sm">
                ACTIVE EMERGENCY BROADCAST
              </AlertTitle>
              <AlertDescription className="text-red-600 text-xs">
                {activeEvents.length} emergencies active across Tamil Nadu.{' '}
                {totals.volunteers} volunteers and {totals.ngos} NGOs are currently responding.{' '}
                {totals.mealsRequired.toLocaleString()} meals required,{' '}
                {totals.mealsDelivered.toLocaleString()} delivered ({deliveryRate}% coverage).
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Siren className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-black text-red-600">{activeEvents.length}</div>
                <div className="text-[10px] md:text-xs font-bold text-red-600/70 uppercase tracking-wider">Active Events</div>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-black text-amber-600">{totals.volunteers.toLocaleString()}</div>
                <div className="text-[10px] md:text-xs font-bold text-amber-600/70 uppercase tracking-wider">Active Volunteers</div>
              </CardContent>
            </Card>
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <HeartHandshake className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-black text-blue-600">{totals.ngos}</div>
                <div className="text-[10px] md:text-xs font-bold text-blue-600/70 uppercase tracking-wider">Active NGOs</div>
              </CardContent>
            </Card>
            <Card className="border-orange-500/30 bg-orange-500/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-black text-orange-600">
                  {totals.affected.toLocaleString()}
                </div>
                <div className="text-[10px] md:text-xs font-bold text-orange-600/70 uppercase tracking-wider">People Affected</div>
              </CardContent>
            </Card>
            <Card className="col-span-2 lg:col-span-1 border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-black text-primary">{deliveryRate}%</div>
                <div className="text-[10px] md:text-xs font-bold text-primary/70 uppercase tracking-wider">Meal Coverage</div>
                <Progress value={deliveryRate} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="events" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <TabsList className="bg-muted/60">
                <TabsTrigger value="events" className="text-xs gap-1.5">
                  <Eye className="h-3 w-3" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="response" className="text-xs gap-1.5">
                  <BarChart3 className="h-3 w-3" />
                  Response Metrics
                </TabsTrigger>
                <TabsTrigger value="create" className="text-xs gap-1.5">
                  <Plus className="h-3 w-3" />
                  Create Alert
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-3 w-3 text-muted-foreground" />
                <div className="flex gap-1 flex-wrap">
                  {(['all', ...Object.keys(EMERGENCY_TYPE_CONFIG)] as const).map((t) => {
                    const cfg = t === 'all' ? null : EMERGENCY_TYPE_CONFIG[t as EmergencyEvent['type']];
                    return (
                      <button
                        key={t}
                        onClick={() => setSelectedType(t as any)}
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                          selectedType === t
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {t === 'all' ? 'All' : cfg?.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <TabsContent value="events" className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Severity:</span>
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map((s) => {
                  const cfg = s === 'all' ? null : SEVERITY_CONFIG[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSeverity(s)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                        selectedSeverity === s
                          ? s === 'all'
                            ? 'bg-primary text-white'
                            : `${cfg!.bg} ${cfg!.border} ${cfg!.color} border`
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {s === 'all' ? 'All' : cfg!.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map((event) => {
                  const typeCfg = EMERGENCY_TYPE_CONFIG[event.type];
                  const sevCfg = SEVERITY_CONFIG[event.severity];
                  const statusCfg = STATUS_CONFIG[event.status];
                  const TypeIcon = typeCfg.icon;
                  const StatusIcon = statusCfg.icon;
                  const progress = event.mealsRequired > 0
                    ? Math.round((event.mealsDelivered / event.mealsRequired) * 100)
                    : 0;
                  const isExpanded = expandedCard === event.id;

                  return (
                    <Card
                      key={event.id}
                      className={`relative overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
                        event.severity === 'critical' ? 'severity-critical-card border-red-500/50' :
                        event.severity === 'high' ? 'border-orange-400/40' : 'border-border'
                      }`}
                      onClick={() => setExpandedCard(isExpanded ? null : event.id)}
                    >
                      {event.severity === 'critical' && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600 animate-pulse" />
                      )}
                      {event.severity === 'high' && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
                      )}

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center border ${typeCfg.bg}`}>
                              <TypeIcon className={`h-4 w-4 ${typeCfg.color}`} />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-bold leading-tight">{event.title}</CardTitle>
                              <CardDescription className="text-[10px] flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                {event.district} District
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={`${statusCfg.color} text-[9px] font-bold px-1.5 py-0`}>
                              <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                              {statusCfg.label}
                            </Badge>
                            <Badge variant="outline" className={`${sevCfg.color} ${sevCfg.bg} ${sevCfg.border} text-[9px] font-bold px-1.5 py-0 ${sevCfg.pulse}`}>
                              {event.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {event.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-muted/50 rounded-lg p-2">
                            <div className="text-lg font-black text-foreground">{event.affectedPopulation.toLocaleString()}</div>
                            <div className="text-[9px] font-bold text-muted-foreground uppercase">Affected</div>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-2">
                            <div className="text-lg font-black text-primary">{event.mealsRequired.toLocaleString()}</div>
                            <div className="text-[9px] font-bold text-muted-foreground uppercase">Meals Needed</div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-muted-foreground">Delivery Progress</span>
                            <span className="font-bold text-primary">{progress}%</span>
                          </div>
                          <Progress
                            value={progress}
                            className="h-2"
                          />
                          <div className="flex justify-between text-[9px] text-muted-foreground">
                            <span>{event.mealsDelivered.toLocaleString()} delivered</span>
                            <span>{(event.mealsRequired - event.mealsDelivered).toLocaleString()} remaining</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-dashed">
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-amber-500" />
                              {event.activeVolunteers}
                            </span>
                            <span className="flex items-center gap-1">
                              <HeartHandshake className="h-3 w-3 text-blue-500" />
                              {event.activeNGOs}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <TimeAgo timestamp={event.startDate} />
                          </span>
                        </div>

                        {isExpanded && (
                          <div className="pt-3 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-muted/50 rounded-lg p-2">
                                <div className="text-sm font-black">{event.radius}km</div>
                                <div className="text-[8px] font-bold text-muted-foreground uppercase">Radius</div>
                              </div>
                              <div className="bg-muted/50 rounded-lg p-2">
                                <div className="text-sm font-black">{event.lat?.toFixed(2)}, {event.lng?.toFixed(2)}</div>
                                <div className="text-[8px] font-bold text-muted-foreground uppercase">Coords</div>
                              </div>
                              <div className="bg-muted/50 rounded-lg p-2">
                                <div className="text-sm font-black">{formatTimestamp(event.startDate)}</div>
                                <div className="text-[8px] font-bold text-muted-foreground uppercase">Started</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="flex-1 bg-primary text-xs" onClick={(e) => e.stopPropagation()}>
                                <Phone className="h-3 w-3 mr-1" />
                                Coordinate
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={(e) => e.stopPropagation()}>
                                <MapPin className="h-3 w-3 mr-1" />
                                View Map
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredEvents.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Shield className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-sm font-bold text-muted-foreground">No emergencies match your filters</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting the type or severity filters</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="response" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary" />
                      Overall Response Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                          <Zap className="h-3 w-3 text-primary" />
                          Meals Required vs Delivered
                        </span>
                        <span className="text-xs font-bold text-primary">{deliveryRate}%</span>
                      </div>
                      <Progress value={deliveryRate} className="h-3" />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{totals.mealsDelivered.toLocaleString()} delivered</span>
                        <span>{totals.mealsRequired.toLocaleString()} required</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">Active Volunteers Deployed</span>
                        <span className="text-lg font-black text-amber-600">{totals.volunteers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">NGOs Coordinating</span>
                        <span className="text-lg font-black text-blue-600">{totals.ngos}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground">People Affected</span>
                        <span className="text-lg font-black text-orange-600">{totals.affected.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Emergency Breakdown by Severity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(['critical', 'high', 'medium', 'low'] as const).map((sev) => {
                      const cfg = SEVERITY_CONFIG[sev];
                      const count = activeEvents.filter((e) => e.severity === sev).length;
                      const pct = activeEvents.length > 0 ? Math.round((count / activeEvents.length) * 100) : 0;
                      return (
                        <div key={sev} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold uppercase tracking-wider ${cfg.color}`}>
                              {cfg.label} Severity
                            </span>
                            <span className="text-xs font-bold">{count} events ({pct}%)</span>
                          </div>
                          <div className={`h-2.5 rounded-full ${cfg.bg} overflow-hidden`}>
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                sev === 'critical' ? 'bg-red-500' :
                                sev === 'high' ? 'bg-orange-500' :
                                sev === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    <div className="border-t pt-4">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-muted-foreground">
                        <BarChart3 className="h-3 w-3" />
                        Emergency Types Active
                      </CardTitle>
                      <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(EMERGENCY_TYPE_CONFIG) as EmergencyEvent['type'][]).map((type) => {
                          const cfg = EMERGENCY_TYPE_CONFIG[type];
                          const TypeIcon = cfg.icon;
                          const count = activeEvents.filter((e) => e.type === type).length;
                          return (
                            <div key={type} className={`rounded-lg border p-2 flex items-center gap-2 ${cfg.bg}`}>
                              <TypeIcon className={`h-3.5 w-3.5 ${cfg.color}`} />
                              <div>
                                <div className="text-xs font-black">{count}</div>
                                <div className="text-[8px] font-bold text-muted-foreground uppercase">{cfg.label}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-primary" />
                    Response Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeEvents.slice(0, 5).map((event, i) => {
                      const typeCfg = EMERGENCY_TYPE_CONFIG[event.type];
                      const TypeIcon = typeCfg.icon;
                      return (
                        <div key={event.id} className="flex items-start gap-3">
                          <div className="relative flex flex-col items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${typeCfg.bg} z-10`}>
                              <TypeIcon className={`h-3.5 w-3.5 ${typeCfg.color}`} />
                            </div>
                            {i < 4 && <div className="w-px h-6 bg-border" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold">{event.title}</span>
                              <Badge variant="outline" className={`text-[8px] font-bold ${SEVERITY_CONFIG[event.severity].color}`}>
                                {event.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {event.district} - {event.activeVolunteers} volunteers, {event.activeNGOs} NGOs responding
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <TimeAgo timestamp={event.startDate} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="create">
              <div className="max-w-2xl mx-auto">
                <Card className="border-primary/20">
                  <CardHeader className="bg-gradient-to-r from-red-500/5 to-orange-500/5">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <Siren className="h-4 w-4 text-red-500" />
                      Create Emergency Alert
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Report a new emergency situation requiring immediate food redistribution coordination
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {submitted ? (
                      <div className="flex flex-col items-center py-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                          <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-bold text-green-700">Emergency Alert Created</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          All nearby volunteers and NGOs have been notified
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Emergency Type
                            </label>
                            <select
                              value={newEvent.type}
                              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as EmergencyEvent['type'] })}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              {Object.entries(EMERGENCY_TYPE_CONFIG).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Severity Level
                            </label>
                            <select
                              value={newEvent.severity}
                              onChange={(e) => setNewEvent({ ...newEvent, severity: e.target.value as EmergencyEvent['severity'] })}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Title
                          </label>
                          <Input
                            placeholder="e.g., Flood Relief in Chennai"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Description
                          </label>
                          <Textarea
                            placeholder="Describe the emergency situation, affected areas, and immediate needs..."
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            className="min-h-[100px]"
                            required
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              District
                            </label>
                            <Input
                              placeholder="e.g., Chennai"
                              value={newEvent.district}
                              onChange={(e) => setNewEvent({ ...newEvent, district: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Affected Population
                            </label>
                            <Input
                              type="number"
                              placeholder="e.g., 50000"
                              value={newEvent.affectedPopulation}
                              onChange={(e) => setNewEvent({ ...newEvent, affectedPopulation: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              Meals Required
                            </label>
                            <Input
                              type="number"
                              placeholder="e.g., 10000"
                              value={newEvent.mealsRequired}
                              onChange={(e) => setNewEvent({ ...newEvent, mealsRequired: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Broadcasting...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Broadcast Emergency Alert
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCreateForm(false)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
