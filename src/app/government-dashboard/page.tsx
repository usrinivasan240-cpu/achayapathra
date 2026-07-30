'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Landmark, MapPin, Users, AlertTriangle, BarChart3, Leaf, Shield,
  TrendingUp, Clock, CheckCircle2, FileText, Download, Building2,
  Globe, Activity, ArrowUpRight, ChevronRight, Loader2, Eye, Zap
} from 'lucide-react';
import { mockDistricts, mockWards, mockEmergencyEvents, mockPlatformAnalytics, mockHungerZones } from '@/lib/data';
import { District, Ward, EmergencyEvent } from '@/lib/types';

function DistrictOverviewCard({ district }: { district: District }) {
  return (
    <div className="p-4 border rounded-xl bg-background hover:border-primary/50 transition-all cursor-pointer group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm">{district.name}</span>
        </div>
        <Badge variant={district.hungerRiskScore > 70 ? 'destructive' : district.hungerRiskScore > 40 ? 'default' : 'secondary'} className="text-[10px]">
          Risk: {district.hungerRiskScore}
        </Badge>
      </div>
      <Progress value={district.hungerRiskScore} className="h-1.5 mb-3" />
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><p className="text-muted-foreground">Donations</p><p className="font-bold">{district.totalDonations.toLocaleString()}</p></div>
        <div><p className="text-muted-foreground">Meals Served</p><p className="font-bold">{district.totalMealsServed.toLocaleString()}</p></div>
        <div><p className="text-muted-foreground">NGOs</p><p className="font-bold">{district.totalNGOs}</p></div>
        <div><p className="text-muted-foreground">CO₂ Saved</p><p className="font-bold">{(district.carbonSavedKg / 1000).toFixed(1)}T</p></div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Population: {(district.population / 100000).toFixed(1)}L</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </div>
  );
}

export default function GovernmentDashboard() {
  const [selectedDistrict, setSelectedDistrict] = React.useState(mockDistricts[0]);
  const activeEmergencies = mockEmergencyEvents.filter(e => e.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            Government Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">District, Taluk and Ward-level food security monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Export Report</Button>
          <Button size="sm"><FileText className="mr-2 h-4 w-4" /> Generate Gazette</Button>
        </div>
      </div>

      {/* Emergency Banner */}
      {activeEmergencies.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive animate-pulse" />
              <div className="flex-1">
                <p className="font-bold text-destructive">{activeEmergencies.length} Active Emergency{activeEmergencies.length > 1 ? 's' : ''}</p>
                <p className="text-sm text-muted-foreground">{activeEmergencies.map(e => e.district).join(', ')} - Immediate response required</p>
              </div>
              <Button variant="destructive" size="sm">View All</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Government Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
        {[
          { label: 'Districts', value: mockDistricts.length, icon: Building2, color: 'text-blue-500' },
          { label: 'Active NGOs', value: mockPlatformAnalytics.totalNGOs, icon: Users, color: 'text-green-500' },
          { label: 'Total Donations', value: mockPlatformAnalytics.totalDonations.toLocaleString(), icon: BarChart3, color: 'text-primary' },
          { label: 'Meals Served', value: (mockPlatformAnalytics.totalMealsServed / 1000).toFixed(0) + 'K', icon: CheckCircle2, color: 'text-green-600' },
          { label: 'CO₂ Saved', value: (mockPlatformAnalytics.totalCO2Saved / 1000).toFixed(1) + 'T', icon: Leaf, color: 'text-green-500' },
          { label: 'Emergencies', value: activeEmergencies.length, icon: AlertTriangle, color: 'text-destructive' },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm border-none bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{stat.label}</p>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-xl font-black">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="districts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 h-auto p-1">
          <TabsTrigger value="districts" className="text-xs font-bold">Districts</TabsTrigger>
          <TabsTrigger value="wards" className="text-xs font-bold">Wards</TabsTrigger>
          <TabsTrigger value="heatmaps" className="text-xs font-bold">Heatmaps</TabsTrigger>
          <TabsTrigger value="food-waste" className="text-xs font-bold">Food Waste</TabsTrigger>
          <TabsTrigger value="carbon" className="text-xs font-bold">Carbon</TabsTrigger>
          <TabsTrigger value="emergency" className="text-xs font-bold">Emergency</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs font-bold">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="districts" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockDistricts.map((district, i) => (
              <DistrictOverviewCard key={i} district={district} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wards" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Ward-Level Monitoring
              </CardTitle>
              <CardDescription>Granular food security data at ward level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockWards.slice(0, 20).map((ward, i) => (
                  <div key={i} className="p-3 border rounded-xl bg-background hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{ward.name}</span>
                          <Badge variant={ward.hungerRiskScore > 70 ? 'destructive' : ward.hungerRiskScore > 40 ? 'default' : 'secondary'} className="text-[10px]">
                            Risk: {ward.hungerRiskScore}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{ward.taluk} • Pop: {(ward.population / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs text-right">
                        <div>
                          <p className="text-muted-foreground">Donations</p>
                          <p className="font-bold">{ward.totalDonations}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">NGOs</p>
                          <p className="font-bold">{ward.totalNGOs}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Growth</p>
                          <p className={`font-bold ${ward.weeklyGrowthRate > 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {ward.weeklyGrowthRate > 0 ? '+' : ''}{ward.weeklyGrowthRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <Progress value={ward.hungerRiskScore} className="mt-2 h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmaps" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" /> AI Hunger Heatmap: Tamil Nadu
                </CardTitle>
                <CardDescription>Real-time risk scoring across urban zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockHungerZones.map((zone, i) => (
                    <div key={i} className="space-y-2 p-4 rounded-xl border bg-background hover:border-primary/50 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">{zone.zone_name}</span>
                        <Badge variant={zone.hunger_risk_score > 70 ? 'destructive' : zone.hunger_risk_score > 50 ? 'default' : 'outline'} className="text-xs">
                          RISK: {zone.hunger_risk_score}
                        </Badge>
                      </div>
                      <Progress value={zone.hunger_risk_score} className="h-2" />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Weekly: {zone.weekly_request_count} requests</span>
                        <span className={zone.last_30_days_growth_rate > 0 ? 'text-destructive' : 'text-green-600'}>
                          {zone.last_30_days_growth_rate > 0 ? '+' : ''}{zone.last_30_days_growth_rate}% growth
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Biogas & Fertilizer Infrastructure
                </CardTitle>
                <CardDescription>Circular economy infrastructure mapping</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Chennai Central Biogas Plant', type: 'Biogas', capacity: '5000 kg/day', status: 'Operational' },
                    { name: 'Coimbatore Green Energy', type: 'Biogas', capacity: '3000 kg/day', status: 'Operational' },
                    { name: 'Chennai Organic Fertilizer', type: 'Fertilizer', capacity: '8000 kg/day', status: 'Operational' },
                    { name: 'Madurai Green Compost', type: 'Fertilizer', capacity: '5000 kg/day', status: 'Operational' },
                    { name: 'Salem Biogas Cooperative', type: 'Biogas', capacity: '2000 kg/day', status: 'Maintenance' },
                  ].map((facility, i) => (
                    <div key={i} className="p-3 border rounded-xl bg-background">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${facility.status === 'Operational' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <div>
                            <p className="font-bold text-sm">{facility.name}</p>
                            <p className="text-xs text-muted-foreground">{facility.type} • {facility.capacity}</p>
                          </div>
                        </div>
                        <Badge variant={facility.status === 'Operational' ? 'default' : 'secondary'} className="text-[10px]">
                          {facility.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="food-waste" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" /> Food Waste Analytics
              </CardTitle>
              <CardDescription>District-wise food waste tracking and reduction targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
                  <p className="text-3xl font-black text-destructive">{(mockDistricts.reduce((a, d) => a + d.foodWasteKg, 0) / 1000).toFixed(1)}T</p>
                  <p className="text-[10px] font-bold text-destructive uppercase">Total Food Waste</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                  <p className="text-3xl font-black text-green-600">{(mockPlatformAnalytics.totalKgRescued / 1000).toFixed(1)}T</p>
                  <p className="text-[10px] font-bold text-green-700 uppercase">Food Rescued</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <p className="text-3xl font-black text-blue-600">{Math.round(mockPlatformAnalytics.totalBiogasRedirected / 1000)}%</p>
                  <p className="text-[10px] font-bold text-blue-700 uppercase">Redirected Rate</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <p className="text-3xl font-black text-purple-600">{(mockPlatformAnalytics.totalFertilizerRedirected / 1000).toFixed(1)}T</p>
                  <p className="text-[10px] font-bold text-purple-700 uppercase">Compost Produced</p>
                </div>
              </div>
              <div className="space-y-2">
                {mockDistricts.slice(0, 10).map((district, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                    <span className="font-bold text-sm w-32">{district.name}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Progress value={(district.foodWasteKg / 20000) * 100} className="h-2 flex-1" />
                        <span className="text-xs font-bold w-16 text-right">{district.foodWasteKg.toLocaleString()} kg</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground w-20 text-right">{(district.carbonSavedKg / 1000).toFixed(1)}T CO₂</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carbon" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" /> Carbon Footprint Dashboard
              </CardTitle>
              <CardDescription>State-level carbon offset tracking from food redistribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
                  <p className="text-3xl font-black text-green-600">{(mockPlatformAnalytics.totalCO2Saved / 1000).toFixed(1)}T</p>
                  <p className="text-[10px] font-bold text-green-700 uppercase">Total CO₂ Saved</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <p className="text-3xl font-black text-blue-600">{Math.round(mockPlatformAnalytics.totalCO2Saved / 21.77).toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-blue-700 uppercase">Trees Equivalent</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <p className="text-3xl font-black text-purple-600">{(mockPlatformAnalytics.totalBiogasRedirected * 0.85 / 1000).toFixed(1)}T</p>
                  <p className="text-[10px] font-bold text-purple-700 uppercase">Methane Avoided</p>
                </div>
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
                  <p className="text-3xl font-black text-orange-600">{(mockPlatformAnalytics.totalBiogasRedirected * 0.12 / 1000).toFixed(1)}M</p>
                  <p className="text-[10px] font-bold text-orange-700 uppercase">kWh Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Emergency Response Centre
              </CardTitle>
              <CardDescription>Real-time emergency monitoring and response coordination</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockEmergencyEvents.map((event, i) => (
                  <div key={i} className={`p-4 border rounded-xl transition-all ${event.status === 'active' ? 'border-destructive/30 bg-destructive/5' : event.status === 'contained' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-4 w-4 ${event.status === 'active' ? 'text-destructive' : event.status === 'contained' ? 'text-yellow-600' : 'text-green-600'}`} />
                        <span className="font-bold text-sm">{event.title}</span>
                      </div>
                      <Badge variant={event.status === 'active' ? 'destructive' : event.status === 'contained' ? 'default' : 'secondary'} className="text-[10px]">
                        {event.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      <div><p className="text-muted-foreground">Affected</p><p className="font-bold">{(event.affectedPopulation / 1000).toFixed(0)}K</p></div>
                      <div><p className="text-muted-foreground">Meals Needed</p><p className="font-bold">{event.mealsRequired.toLocaleString()}</p></div>
                      <div><p className="text-muted-foreground">Delivered</p><p className="font-bold text-green-600">{event.mealsDelivered.toLocaleString()}</p></div>
                      <div><p className="text-muted-foreground">Volunteers</p><p className="font-bold">{event.activeVolunteers}</p></div>
                    </div>
                    <Progress value={(event.mealsDelivered / event.mealsRequired) * 100} className="mt-2 h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" /> District Performance Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockDistricts.sort((a, b) => b.totalMealsServed - a.totalMealsServed).slice(0, 10).map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                        <span className="text-sm font-medium">{d.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{d.totalMealsServed.toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground">meals</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" /> Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Match Success Rate', value: mockPlatformAnalytics.matchSuccessRate, color: 'green' },
                    { label: 'Avg Match Time', value: mockPlatformAnalytics.avgMatchTime, unit: 'min', color: 'blue' },
                    { label: 'Daily Active Users', value: mockPlatformAnalytics.dailyActiveUsers, color: 'purple' },
                    { label: 'Monthly Growth', value: mockPlatformAnalytics.monthlyGrowth, unit: '%', color: 'orange' },
                  ].map((metric, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{metric.label}</span>
                        <span className="font-bold">{metric.value}{metric.unit || ''}</span>
                      </div>
                      <Progress value={typeof metric.value === 'number' ? Math.min(metric.value, 100) : 0} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
