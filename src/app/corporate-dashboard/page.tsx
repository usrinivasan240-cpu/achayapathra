'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Building2, TrendingUp, MapPin, Users, Award, BarChart3, Leaf, FileText,
  Clock, CheckCircle2, AlertTriangle, ArrowUpRight, DollarSign, Globe,
  Briefcase, PieChart, Download, Filter, Search, Loader2, Eye, Plus
} from 'lucide-react';
import { mockCorporates, mockDonations, mockPlatformAnalytics } from '@/lib/data';

export default function CorporateDashboard() {
  const [selectedCorporate, setSelectedCorporate] = React.useState(mockCorporates[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Corporate Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">CSR, ESG tracking and corporate food donation management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Export Report</Button>
          <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Register Branch</Button>
        </div>
      </div>

      {/* Corporate Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'CSR Budget', value: `₹${(selectedCorporate.csrBudget / 100000).toFixed(1)}L`, icon: DollarSign, color: 'text-green-500' },
          { label: 'CSR Spent', value: `${Math.round((selectedCorporate.csrSpent / selectedCorporate.csrBudget) * 100)}%`, icon: PieChart, color: 'text-blue-500' },
          { label: 'ESG Score', value: `${selectedCorporate.esgScore}/100`, icon: Globe, color: 'text-purple-500' },
          { label: 'Meals Served', value: selectedCorporate.totalMealsServed.toLocaleString(), icon: Users, color: 'text-orange-500' },
          { label: 'Carbon Offset', value: `${(selectedCorporate.carbonOffsetKg / 1000).toFixed(1)}T`, icon: Leaf, color: 'text-green-600' },
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto p-1">
          <TabsTrigger value="overview" className="text-xs font-bold">Overview</TabsTrigger>
          <TabsTrigger value="branches" className="text-xs font-bold">Branches</TabsTrigger>
          <TabsTrigger value="employees" className="text-xs font-bold">Employees</TabsTrigger>
          <TabsTrigger value="csr" className="text-xs font-bold">CSR</TabsTrigger>
          <TabsTrigger value="esg" className="text-xs font-bold">ESG</TabsTrigger>
          <TabsTrigger value="certificates" className="text-xs font-bold">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4" /> Monthly Donations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
                    <div key={month} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-8">{month}</span>
                      <Progress value={Math.random() * 80 + 20} className="flex-1 h-2" />
                      <span className="text-xs font-bold w-12 text-right">{Math.floor(Math.random() * 50 + 10)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4" /> Top Corporate Donors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockCorporates.slice(0, 5).map((corp, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                        <span className="text-sm font-medium">{corp.companyName}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{corp.totalMealsServed.toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground">meals</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="branches" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Branch Locations
              </CardTitle>
              <CardDescription>All registered corporate branches across Tamil Nadu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {selectedCorporate.branches.map((branch, i) => (
                  <div key={i} className="p-4 border rounded-xl bg-background hover:border-primary/50 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm">{branch.name}</span>
                      <Badge variant={branch.isActive ? 'default' : 'secondary'} className="text-[10px]">
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{branch.address}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Employees</p>
                        <p className="font-bold">{branch.employeeCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Donations</p>
                        <p className="font-bold">{branch.totalDonations}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs">
                      <p className="text-muted-foreground">Manager: {branch.managerName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Employee Participation
              </CardTitle>
              <CardDescription>{selectedCorporate.activeEmployees} active out of {selectedCorporate.employeeCount} employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-3 mb-6">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                  <p className="text-3xl font-black text-primary">{selectedCorporate.activeEmployees}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Donors</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-center">
                  <p className="text-3xl font-black text-green-600">{Math.round((selectedCorporate.activeEmployees / selectedCorporate.employeeCount) * 100)}%</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Participation Rate</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-center">
                  <p className="text-3xl font-black text-blue-600">{Math.round(selectedCorporate.totalDonations / selectedCorporate.activeEmployees)}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Avg Donations/Employee</p>
                </div>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 10 }, (_, i) => ({
                  name: `Employee ${i + 1}`,
                  dept: ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations'][i % 5],
                  donations: Math.floor(Math.random() * 20 + 1),
                  meals: Math.floor(Math.random() * 200 + 10),
                })).map((emp, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.dept}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold">{emp.donations} donations</p>
                      <p className="text-muted-foreground">{emp.meals} meals</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csr" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> CSR Activity Log
              </CardTitle>
              <CardDescription>Corporate Social Responsibility activities and spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="p-4 rounded-xl border bg-background">
                  <p className="text-sm text-muted-foreground">Total CSR Budget</p>
                  <p className="text-2xl font-black">₹{(selectedCorporate.csrBudget / 100000).toFixed(1)} Lakh</p>
                  <Progress value={(selectedCorporate.csrSpent / selectedCorporate.csrBudget) * 100} className="mt-2 h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{Math.round((selectedCorporate.csrSpent / selectedCorporate.csrBudget) * 100)}% utilized</p>
                </div>
                <div className="p-4 rounded-xl border bg-background">
                  <p className="text-sm text-muted-foreground">Meals Served via CSR</p>
                  <p className="text-2xl font-black text-green-600">{selectedCorporate.totalMealsServed.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Cost per meal: ₹{Math.round(selectedCorporate.csrSpent / selectedCorporate.totalMealsServed)}</p>
                </div>
              </div>
              <div className="space-y-2">
                {['Food Donation Drive - Chennai', 'Volunteer Training Program', 'Biogas Infrastructure', 'Community Kitchen Setup', 'Awareness Campaign'].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">{activity}</p>
                        <p className="text-xs text-muted-foreground">{['Food Donation', 'Volunteer', 'Infrastructure', 'Infrastructure', 'Awareness'][i]} • {new Date(Date.now() - i * 7 * 86400000).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">₹{(Math.random() * 500000 + 50000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
                      <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 500 + 50)} meals</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="esg" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" /> ESG Score Breakdown
              </CardTitle>
              <CardDescription>Environmental, Social and Governance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                {[
                  { label: 'Environmental', score: Math.round(selectedCorporate.esgScore * 0.4), color: 'green', icon: Leaf },
                  { label: 'Social', score: Math.round(selectedCorporate.esgScore * 0.35), color: 'blue', icon: Users },
                  { label: 'Governance', score: Math.round(selectedCorporate.esgScore * 0.25), color: 'purple', icon: Award },
                ].map((dim, i) => (
                  <div key={i} className="p-4 rounded-xl border bg-background text-center">
                    <dim.icon className={`h-8 w-8 text-${dim.color}-500 mx-auto mb-2`} />
                    <p className="text-3xl font-black">{dim.score}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase">{dim.label}</p>
                    <Progress value={dim.score} className={`mt-2 h-2`} />
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <p className="text-4xl font-black text-primary">{selectedCorporate.esgScore}</p>
                <p className="text-sm font-bold text-muted-foreground">Overall ESG Score</p>
                <Badge className="mt-2" variant={selectedCorporate.esgScore >= 70 ? 'default' : 'secondary'}>
                  {selectedCorporate.esgScore >= 80 ? 'Excellent' : selectedCorporate.esgScore >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" /> CSR Certificates
              </CardTitle>
              <CardDescription>Download and verify CSR impact certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {['Annual CSR Report 2025', 'Q4 Impact Certificate', 'Environmental Offset Certificate', 'Social Impact Award'].map((cert, i) => (
                  <div key={i} className="p-4 border rounded-xl bg-background hover:border-primary/50 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Award className="h-5 w-5 text-primary mb-2" />
                        <p className="font-bold text-sm">{cert}</p>
                        <p className="text-xs text-muted-foreground">Issued: {new Date(Date.now() - i * 30 * 86400000).toLocaleDateString()}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-1 h-3 w-3" /> PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
