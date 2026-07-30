'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Cpu, Zap, Brain, TrendingUp, Shield, Clock, MapPin, Truck,
  AlertTriangle, BarChart3, Target, RefreshCw, Loader2, CheckCircle2,
  XCircle, ArrowRight, Sparkles, Activity, Globe, Leaf
} from 'lucide-react';
import { mockDonations, mockNGOs, mockHungerZones, mockDemandPredictions, mockPlatformAnalytics } from '@/lib/data';
import { Donation, SmartMatchResult, DemandPrediction, MatchFactors } from '@/lib/types';

const calculateMatchFactors = (donation: Donation, ngo: any): MatchFactors => {
  const distance = donation.lat && donation.lng
    ? Math.sqrt(Math.pow((donation.lat || 0) - (ngo.lat || 0), 2) + Math.pow((donation.lng || 0) - (ngo.lng || 0), 2)) * 111
    : rand(1, 50);

  return {
    distanceScore: Math.max(0, 100 - distance * 2),
    expiryScore: Math.random() * 40 + 60,
    quantityScore: Math.random() * 30 + 70,
    foodTypeScore: Math.random() * 20 + 80,
    volunteerScore: Math.random() * 50 + 50,
    trafficScore: Math.random() * 40 + 60,
    capacityScore: Math.random() * 30 + 70,
    demandScore: Math.random() * 40 + 60,
    inventoryScore: Math.random() * 30 + 70,
  };
};

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateSmartMatches = (): SmartMatchResult[] => {
  const available = mockDonations.filter(d => d.status === 'Available').slice(0, 20);
  const matches: SmartMatchResult[] = [];

  available.forEach(donation => {
    const randomNGOs = mockNGOs.sort(() => Math.random() - 0.5).slice(0, 3);
    randomNGOs.forEach(ngo => {
      const factors = calculateMatchFactors(donation, ngo);
      const matchScore = Math.round(
        (factors.distanceScore * 0.2 + factors.expiryScore * 0.15 + factors.quantityScore * 0.1 +
         factors.foodTypeScore * 0.15 + factors.volunteerScore * 0.1 + factors.trafficScore * 0.05 +
         factors.capacityScore * 0.1 + factors.demandScore * 0.1 + factors.inventoryScore * 0.05)
      );
      matches.push({
        donationId: donation.id,
        ngoId: ngo.id,
        matchScore,
        eta: Math.round(factors.distanceScore > 70 ? 15 + Math.random() * 20 : 30 + Math.random() * 40),
        confidence: Math.min(98, matchScore + Math.round(Math.random() * 10)),
        distance: Math.round(factors.distanceScore > 70 ? 2 + Math.random() * 8 : 10 + Math.random() * 25),
        factors,
      });
    });
  });

  return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 30);
};

export function AISmartMatchPanel() {
  const [matches, setMatches] = React.useState<SmartMatchResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [selectedMatch, setSelectedMatch] = React.useState<SmartMatchResult | null>(null);

  const runMatching = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setMatches(generateSmartMatches());
      setIsAnalyzing(false);
    }, 1500);
  };

  React.useEffect(() => {
    setMatches(generateSmartMatches());
  }, []);

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          AI Smart Matching Engine
        </CardTitle>
        <CardDescription>
          Multi-factor analysis: Distance, Expiry, Quantity, Food Type, Volunteer Availability, Traffic, NGO Capacity, Demand, Inventory
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button onClick={runMatching} disabled={isAnalyzing} className="bg-primary">
            {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            {isAnalyzing ? 'Analyzing...' : 'Run AI Matching'}
          </Button>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="mr-1 h-3 w-3" /> {matches.length} matches found
          </Badge>
        </div>

        {matches.length > 0 && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {matches.slice(0, 10).map((match, i) => {
              const donation = mockDonations.find(d => d.id === match.donationId);
              const ngo = mockNGOs.find(n => n.id === match.ngoId);
              return (
                <div key={i} className="p-3 border rounded-xl bg-background hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => setSelectedMatch(selectedMatch === match ? null : match)}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{donation?.foodName || 'Food Item'}</span>
                        <Badge className={`${match.matchScore >= 80 ? 'bg-green-500' : match.matchScore >= 60 ? 'bg-yellow-500' : 'bg-orange-500'} text-white text-[10px]`}>
                          {match.matchScore}% Match
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">→ {ngo?.name || 'NGO'}</p>
                    </div>
                    <div className="text-right text-xs space-y-1">
                      <div className="flex items-center gap-1 text-primary font-bold">
                        <Clock className="h-3 w-3" /> {match.eta}min ETA
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {match.distance}km
                      </div>
                    </div>
                  </div>

                  {selectedMatch === match && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        {Object.entries(match.factors).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground capitalize">{key.replace('Score', '')}</span>
                              <span className="font-bold">{Math.round(value)}%</span>
                            </div>
                            <Progress value={value} className="h-1" />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span className="font-bold">AI Confidence: {match.confidence}%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DemandPredictionPanel() {
  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-500/5 to-blue-500/10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          AI Demand Prediction
        </CardTitle>
        <CardDescription>7-day rolling demand forecast for Tamil Nadu zones</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {mockDemandPredictions.slice(0, 8).map((pred, i) => (
            <div key={i} className="p-3 border rounded-xl bg-background hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{pred.zoneName}</span>
                  <Badge variant={pred.trend === 'increasing' ? 'destructive' : pred.trend === 'decreasing' ? 'default' : 'secondary'} className="text-[10px]">
                    {pred.trend === 'increasing' ? '↑' : pred.trend === 'decreasing' ? '↓' : '→'} {pred.trend}
                  </Badge>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {Math.round(pred.confidence * 100)}% confidence
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-muted-foreground">Current</p>
                  <p className="font-bold text-primary">{pred.currentDemand} meals</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Predicted</p>
                  <p className="font-bold">{pred.predictedDemand} meals</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Change</p>
                  <p className={`font-bold ${pred.predictedDemand > pred.currentDemand ? 'text-destructive' : 'text-green-600'}`}>
                    {pred.predictedDemand > pred.currentDemand ? '+' : ''}{pred.predictedDemand - pred.currentDemand}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {pred.factors.map((f, j) => (
                  <Badge key={j} variant="outline" className="text-[9px]">{f}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CarbonCalculatorWidget() {
  const totalCO2 = mockPlatformAnalytics.totalCO2Saved;
  const totalMeals = mockPlatformAnalytics.totalMealsServed;
  const treesEquivalent = Math.round(totalCO2 / 21.77);
  const waterSaved = Math.round(totalMeals * 17.5);

  return (
    <Card className="border-green-500/20 shadow-sm bg-gradient-to-br from-green-500/5 to-emerald-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Leaf className="h-5 w-5 text-green-500" />
          Carbon Impact Calculator
        </CardTitle>
        <CardDescription>Environmental impact of food redistribution</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <Globe className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-green-600">{(totalCO2 / 1000).toFixed(1)}T</p>
            <p className="text-[10px] font-bold text-green-700 uppercase">CO₂ Saved</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
            <Activity className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-blue-600">{treesEquivalent.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-blue-700 uppercase">Trees Equivalent</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
            <BarChart3 className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-purple-600">{(waterSaved / 1000000).toFixed(1)}M</p>
            <p className="text-[10px] font-bold text-purple-700 uppercase">Liters Water Saved</p>
          </div>
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
            <Target className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-orange-600">{(mockPlatformAnalytics.totalBiogasRedirected / 1000).toFixed(1)}T</p>
            <p className="text-[10px] font-bold text-orange-700 uppercase">Methane Avoided</p>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-green-500/5 border border-dashed border-green-500/30">
          <p className="text-xs text-center text-green-700 font-medium">
            🌱 Equivalent to planting {treesEquivalent.toLocaleString()} trees or powering {Math.round(totalCO2 * 0.12).toLocaleString()} homes for a year
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmergencyPredictionPanel() {
  const [activeEmergencies, setActiveEmergencies] = React.useState(3);

  return (
    <Card className="border-destructive/20 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-destructive/5 to-destructive/10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          AI Emergency Prediction
        </CardTitle>
        <CardDescription>Real-time crisis monitoring and prediction for Tamil Nadu</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
            <p className="text-2xl font-black text-destructive">{activeEmergencies}</p>
            <p className="text-[10px] font-bold text-destructive uppercase">Active</p>
          </div>
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
            <p className="text-2xl font-black text-yellow-600">7</p>
            <p className="text-[10px] font-bold text-yellow-700 uppercase">Predicted</p>
          </div>
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <p className="text-2xl font-black text-green-600">12</p>
            <p className="text-[10px] font-bold text-green-700 uppercase">Resolved</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { zone: 'Chennai Coastal', risk: 85, type: 'Cyclone', time: '48h' },
            { zone: 'Madurai District', risk: 72, type: 'Flood', time: '72h' },
            { zone: 'Coimbatore South', risk: 45, type: 'Drought', time: '7d' },
          ].map((item, i) => (
            <div key={i} className="p-3 border rounded-xl bg-background flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{item.zone}</span>
                  <Badge variant="destructive" className="text-[10px]">{item.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Predicted in {item.time}</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-black ${item.risk > 70 ? 'text-destructive' : item.risk > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {item.risk}%
                </p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">Risk</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function VolunteerOptimizationPanel() {
  const volunteers = [
    { name: 'Arjun Kumar', zone: 'Chennai', trips: 12, efficiency: 94, status: 'active' },
    { name: 'Priya Selvan', zone: 'Madurai', trips: 8, efficiency: 89, status: 'active' },
    { name: 'Karthik Raj', zone: 'Coimbatore', trips: 15, efficiency: 97, status: 'active' },
    { name: 'Divya Nair', zone: 'Trichy', trips: 6, efficiency: 85, status: 'busy' },
    { name: 'Suresh Babu', zone: 'Salem', trips: 10, efficiency: 91, status: 'active' },
  ];

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="h-5 w-5 text-primary" />
          Volunteer Optimization
        </CardTitle>
        <CardDescription>AI-optimized volunteer routing and assignment</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {volunteers.map((vol, i) => (
            <div key={i} className="p-3 border rounded-xl bg-background hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{vol.name}</span>
                    <Badge variant={vol.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                      {vol.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{vol.zone} • {vol.trips} trips today</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black ${vol.efficiency >= 90 ? 'text-green-600' : vol.efficiency >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {vol.efficiency}%
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">Efficiency</p>
                </div>
              </div>
              <Progress value={vol.efficiency} className="mt-2 h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecommendationEngine() {
  const recommendations = [
    { title: 'Increase Chennai coverage', description: 'Add 5 more volunteers to reduce ETA by 12%', impact: 'High', icon: Target },
    { title: 'Redirect surplus to biogas', description: '120kg expiring food can generate 45kWh energy', impact: 'Medium', icon: Leaf },
    { title: 'Partner with local temples', description: '15 temples can serve 500+ meals daily', impact: 'High', icon: Sparkles },
    { title: 'Optimize Madurai route', description: 'New route saves 18min per delivery', impact: 'Medium', icon: MapPin },
  ];

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-purple-500/5 to-purple-500/10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Recommendations
        </CardTitle>
        <CardDescription>Smart suggestions to improve platform efficiency</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <div key={i} className="p-3 border rounded-xl bg-background hover:border-purple-500/30 transition-all cursor-pointer group">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <rec.icon className="h-4 w-4 text-purple-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{rec.title}</span>
                    <Badge variant={rec.impact === 'High' ? 'default' : 'secondary'} className="text-[10px]">
                      {rec.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AIInsightsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" />
            AI Intelligence Hub
          </h1>
          <p className="text-muted-foreground text-sm">AI-powered insights, matching, and predictions for the platform</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Powered by Gemini 2.0
        </Badge>
      </div>

      <Tabs defaultValue="matching" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1">
          <TabsTrigger value="matching" className="text-xs font-bold">Smart Matching</TabsTrigger>
          <TabsTrigger value="prediction" className="text-xs font-bold">Demand Prediction</TabsTrigger>
          <TabsTrigger value="carbon" className="text-xs font-bold">Carbon Calculator</TabsTrigger>
          <TabsTrigger value="emergency" className="text-xs font-bold">Emergency AI</TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs font-bold">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="matching" className="mt-4">
          <AISmartMatchPanel />
        </TabsContent>

        <TabsContent value="prediction" className="mt-4">
          <DemandPredictionPanel />
        </TabsContent>

        <TabsContent value="carbon" className="mt-4">
          <CarbonCalculatorWidget />
        </TabsContent>

        <TabsContent value="emergency" className="mt-4">
          <EmergencyPredictionPanel />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <RecommendationEngine />
            <VolunteerOptimizationPanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
