'use client';

import { useState, useMemo } from 'react';
import { mockUsers, mockPlatformAnalytics, mockAuditLogs } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  Users,
  Settings,
  Activity,
  Database,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
  Server,
} from 'lucide-react';
import type { UserProfile } from '@/lib/types';

const ROLE_FILTERS = ['all', 'admin', 'donor', 'volunteer', 'ngo', 'corporate', 'government', 'receiver'] as const;
type RoleFilter = (typeof ROLE_FILTERS)[number];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  donor: 'bg-orange-100 text-orange-700',
  volunteer: 'bg-blue-100 text-blue-700',
  ngo: 'bg-green-100 text-green-700',
  corporate: 'bg-purple-100 text-purple-700',
  government: 'bg-indigo-100 text-indigo-700',
  receiver: 'bg-yellow-100 text-yellow-700',
};

function StatusDot({ color }: { color: 'green' | 'yellow' | 'red' }) {
  const colors = {
    green: 'bg-green-500 shadow-green-500/50',
    yellow: 'bg-yellow-500 shadow-yellow-500/50',
    red: 'bg-red-500 shadow-red-500/50',
  };
  return (
    <span className={`inline-block h-2.5 w-2.5 rounded-full shadow-lg ${colors[color]}`} />
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  status,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  status?: 'green' | 'yellow' | 'red';
}) {
  return (
    <Card className="relative overflow-hidden border-orange-100 bg-gradient-to-br from-white to-orange-50/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
                {trendUp ? '\u2191' : '\u2193'} {trend}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-orange-100 p-2.5">
            <Icon className="h-5 w-5 text-orange-600" />
          </div>
        </div>
        {status && (
          <div className="absolute right-4 top-4">
            <StatusDot color={status} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminPanelPage() {
  const analytics = mockPlatformAnalytics;

  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [userSearch, setUserSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoMatch, setAutoMatch] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [auditPage, setAuditPage] = useState(0);

  const AUDIT_PAGE_SIZE = 15;

  const filteredUsers = useMemo(() => {
    let users = mockUsers;
    if (roleFilter !== 'all') {
      users = users.filter((u) => u.role === roleFilter);
    }
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      users = users.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
      );
    }
    return users;
  }, [roleFilter, userSearch]);

  const filteredAuditLogs = useMemo(() => {
    let logs = mockAuditLogs;
    if (auditSearch.trim()) {
      const q = auditSearch.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.resource.toLowerCase().includes(q) ||
          l.userId.toLowerCase().includes(q)
      );
    }
    return logs;
  }, [auditSearch]);

  const paginatedAuditLogs = filteredAuditLogs.slice(
    auditPage * AUDIT_PAGE_SIZE,
    (auditPage + 1) * AUDIT_PAGE_SIZE
  );
  const totalAuditPages = Math.ceil(filteredAuditLogs.length / AUDIT_PAGE_SIZE);

  const pendingVerifications = useMemo(() => {
    return mockUsers.filter(
      (u) => u.verified === false || (u.role === 'ngo' && Math.random() > 0.6)
    ).slice(0, 20);
  }, []);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mockUsers.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    return counts;
  }, []);

  const systemServices = [
    { name: 'Database', status: 'green' as const, icon: Database, latency: '12ms' },
    { name: 'Authentication', status: 'green' as const, icon: Lock, latency: '8ms' },
    { name: 'AI Matching Engine', status: emergencyMode ? 'yellow' as const : 'green' as const, icon: Activity, latency: '45ms' },
    { name: 'File Storage', status: 'green' as const, icon: Server, latency: '23ms' },
    { name: 'Real-time Sync', status: maintenanceMode ? 'red' as const : 'green' as const, icon: RefreshCw, latency: '5ms' },
  ];

  const formatTimestamp = (ts: { toDate: () => Date }) => {
    try {
      return ts.toDate().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-white">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-3 shadow-lg shadow-orange-500/25">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Control Center</h1>
              <p className="text-sm text-muted-foreground">
                Platform management &amp; monitoring — Achayapathra
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm shadow-sm">
              <StatusDot color={maintenanceMode ? 'red' : 'green'} />
              <span className="font-medium text-gray-700">
                {maintenanceMode ? 'Maintenance' : 'Operational'}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm shadow-sm">
              <StatusDot color={emergencyMode ? 'yellow' : 'green'} />
              <span className="font-medium text-gray-700">
                {emergencyMode ? 'Emergency Active' : 'Normal'}
              </span>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Platform Health Metrics */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            title="Total Users"
            value={analytics.totalUsers.toLocaleString()}
            icon={Users}
            trend="+12.4% this month"
            trendUp
            status="green"
          />
          <MetricCard
            title="Total Donations"
            value={analytics.totalDonations.toLocaleString()}
            icon={CheckCircle2}
            trend="+8.2% this month"
            trendUp
            status="green"
          />
          <MetricCard
            title="Registered NGOs"
            value={analytics.totalNGOs}
            icon={Shield}
            trend="+3 new"
            trendUp
            status="green"
          />
          <MetricCard
            title="Active Volunteers"
            value={analytics.totalVolunteers.toLocaleString()}
            icon={Activity}
            trend="+15.7% growth"
            trendUp
            status="green"
          />
          <MetricCard
            title="Corporate Partners"
            value={analytics.totalCorporates}
            icon={FileText}
            trend="+5 this quarter"
            trendUp
            status="green"
          />
        </div>

        {/* Secondary Metrics Row */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-orange-100">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Meals Served</p>
              <p className="text-xl font-bold text-orange-600">
                {analytics.totalMealsServed.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-orange-100">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">CO₂ Saved (kg)</p>
              <p className="text-xl font-bold text-green-600">
                {analytics.totalCO2Saved.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="border-orange-100">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Avg Match Time</p>
              <p className="text-xl font-bold text-blue-600">{analytics.avgMatchTime}m</p>
            </CardContent>
          </Card>
          <Card className="border-orange-100">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Match Success Rate</p>
              <p className="text-xl font-bold text-emerald-600">{analytics.matchSuccessRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-white shadow-sm border border-orange-100 p-1">
            <TabsTrigger value="users" className="gap-1.5 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Users className="h-3.5 w-3.5" /> Users
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Eye className="h-3.5 w-3.5" /> Audit Log
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Settings className="h-3.5 w-3.5" /> Settings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Activity className="h-3.5 w-3.5" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="verifications" className="gap-1.5 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verifications
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-1.5 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Server className="h-3.5 w-3.5" /> System
            </TabsTrigger>
          </TabsList>

          {/* ========== USERS TAB ========== */}
          <TabsContent value="users">
            <Card className="border-orange-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-orange-500" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {ROLE_FILTERS.map((role) => (
                      <button
                        key={role}
                        onClick={() => setRoleFilter(role)}
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-all ${
                          roleFilter === role
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {role}
                        {role !== 'all' && roleCounts[role] !== undefined && (
                          <span className="ml-1 opacity-70">({roleCounts[role]})</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full sm:w-64"
                  />
                </div>

                {/* User Table */}
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-orange-50/50">
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden lg:table-cell">Donations</TableHead>
                        <TableHead className="hidden lg:table-cell">Level</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.slice(0, 50).map((user) => (
                        <TableRow key={user.id} className="hover:bg-orange-50/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="h-8 w-8 rounded-full object-cover ring-2 ring-orange-100"
                              />
                              <div>
                                <p className="text-sm font-medium">{user.displayName}</p>
                                <p className="text-xs text-muted-foreground">{user.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {user.totalDonations ?? 0}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="outline" className="border-orange-200 text-orange-600">
                              Lv {user.level ?? 1}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.verified ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Showing {Math.min(50, filteredUsers.length)} of {filteredUsers.length} users
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== AUDIT LOG TAB ========== */}
          <TabsContent value="audit">
            <Card className="border-orange-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-orange-500" />
                  Audit Log Viewer
                  <Badge variant="secondary" className="ml-auto">
                    {filteredAuditLogs.length} entries
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Input
                    placeholder="Search audit logs..."
                    value={auditSearch}
                    onChange={(e) => {
                      setAuditSearch(e.target.value);
                      setAuditPage(0);
                    }}
                    className="w-full sm:w-72"
                  />
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Export Logs
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-orange-50/50">
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead className="hidden md:table-cell">Timestamp</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAuditLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-orange-50/30">
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {log.id}
                          </TableCell>
                          <TableCell className="text-sm">{log.userId}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${
                                log.action === 'delete'
                                  ? 'border-red-200 text-red-600'
                                  : log.action === 'create'
                                  ? 'border-green-200 text-green-600'
                                  : log.action === 'update'
                                  ? 'border-blue-200 text-blue-600'
                                  : 'border-gray-200 text-gray-600'
                              }`}
                            >
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm capitalize">{log.resource}</TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                            {formatTimestamp(log.timestamp)}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {log.resourceId}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Page {auditPage + 1} of {totalAuditPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={auditPage === 0}
                      onClick={() => setAuditPage((p) => Math.max(0, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={auditPage >= totalAuditPages - 1}
                      onClick={() => setAuditPage((p) => Math.min(totalAuditPages - 1, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== SETTINGS TAB ========== */}
          <TabsContent value="settings">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* System Settings */}
              <Card className="border-orange-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5 text-orange-500" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Emergency Mode */}
                  <div className="flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${emergencyMode ? 'bg-red-100' : 'bg-green-100'}`}>
                        <AlertTriangle className={`h-5 w-5 ${emergencyMode ? 'text-red-600' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Emergency Mode</p>
                        <p className="text-xs text-muted-foreground">
                          {emergencyMode ? 'Active — prioritizing emergency relief' : 'Normal operations'}
                        </p>
                      </div>
                    </div>
                    <Switch checked={emergencyMode} onCheckedChange={setEmergencyMode} />
                  </div>

                  {/* Maintenance Mode */}
                  <div className="flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${maintenanceMode ? 'bg-red-100' : 'bg-green-100'}`}>
                        <Lock className={`h-5 w-5 ${maintenanceMode ? 'text-red-600' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Maintenance Mode</p>
                        <p className="text-xs text-muted-foreground">
                          {maintenanceMode ? 'Platform is in maintenance' : 'All systems running'}
                        </p>
                      </div>
                    </div>
                    <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                  </div>

                  {/* Auto Match */}
                  <div className="flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">AI Auto-Matching</p>
                        <p className="text-xs text-muted-foreground">
                          {autoMatch ? 'Enabled — automatic donation-NGO matching' : 'Disabled — manual matching only'}
                        </p>
                      </div>
                    </div>
                    <Switch checked={autoMatch} onCheckedChange={setAutoMatch} />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Platform Health Summary</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-green-50 p-3 text-center">
                        <p className="text-lg font-bold text-green-600">
                          {mockUsers.filter((u) => u.verified).length}
                        </p>
                        <p className="text-xs text-green-600">Verified</p>
                      </div>
                      <div className="rounded-lg bg-yellow-50 p-3 text-center">
                        <p className="text-lg font-bold text-yellow-600">{pendingVerifications.length}</p>
                        <p className="text-xs text-yellow-600">Pending</p>
                      </div>
                      <div className="rounded-lg bg-red-50 p-3 text-center">
                        <p className="text-lg font-bold text-red-600">
                          {mockUsers.filter((u) => !u.verified).length - pendingVerifications.length}
                        </p>
                        <p className="text-xs text-red-600">Issues</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Announcements */}
              <Card className="border-orange-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-orange-500" />
                    Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Send Platform Announcement</label>
                    <textarea
                      value={announcement}
                      onChange={(e) => setAnnouncement(e.target.value)}
                      placeholder="Type an announcement for all users..."
                      className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 min-h-[100px] resize-none"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                        Send Announcement
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setAnnouncement('')}>
                        Clear
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Recent Announcements</p>
                    {[
                      { title: 'Platform maintenance on Aug 15', date: '2 hours ago', type: 'maintenance' },
                      { title: 'New emergency relief feature launched', date: '1 day ago', type: 'feature' },
                      { title: 'CSR reporting deadline extended', date: '3 days ago', type: 'info' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50/30 p-3">
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                        <Badge variant="outline" className="border-orange-200 text-orange-600 capitalize">
                          {item.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ========== ANALYTICS TAB ========== */}
          <TabsContent value="analytics">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Real-time Overview */}
              <Card className="border-orange-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-orange-500" />
                    Real-Time Analytics Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-orange-100 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Daily Active Users</p>
                      <p className="text-2xl font-bold text-orange-600">{analytics.dailyActiveUsers}</p>
                    </div>
                    <div className="rounded-lg border border-orange-100 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Monthly Growth</p>
                      <p className="text-2xl font-bold text-green-600">{analytics.monthlyGrowth}%</p>
                    </div>
                    <div className="rounded-lg border border-orange-100 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Avg Delivery Time</p>
                      <p className="text-2xl font-bold text-blue-600">{analytics.avgDeliveryTime}m</p>
                    </div>
                    <div className="rounded-lg border border-orange-100 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Food Rescued (kg)</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {analytics.totalKgRescued.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <p className="text-sm font-medium">User Distribution by Role</p>
                    {Object.entries(roleCounts)
                      .filter(([role]) => role !== 'admin')
                      .sort((a, b) => b[1] - a[1])
                      .map(([role, count]) => (
                        <div key={role} className="flex items-center gap-3">
                          <span className="w-20 text-xs font-medium capitalize text-muted-foreground">
                            {role}
                          </span>
                          <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-2.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
                              style={{
                                width: `${Math.min((count / analytics.totalUsers) * 100 * 8, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="w-12 text-right text-xs font-semibold text-gray-700">
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Impact Metrics */}
              <Card className="border-orange-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle2 className="h-5 w-5 text-orange-500" />
                    Impact &amp; Environmental Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100/50 p-4">
                      <p className="text-xs font-medium text-orange-700">Meals Served</p>
                      <p className="text-2xl font-bold text-orange-800">
                        {analytics.totalMealsServed.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 p-4">
                      <p className="text-xs font-medium text-green-700">CO₂ Saved (kg)</p>
                      <p className="text-2xl font-bold text-green-800">
                        {analytics.totalCO2Saved.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 p-4">
                      <p className="text-xs font-medium text-blue-700">Biogas Redirected</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {analytics.totalBiogasRedirected.toLocaleString()} kg
                      </p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 p-4">
                      <p className="text-xs font-medium text-purple-700">Fertilizer Redirected</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {analytics.totalFertilizerRedirected.toLocaleString()} kg
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Performance Indicators</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Match Success Rate</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-green-500"
                              style={{ width: `${analytics.matchSuccessRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-green-600">
                            {analytics.matchSuccessRate}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Avg Match Time</span>
                        <span className="text-xs font-semibold text-blue-600">
                          {analytics.avgMatchTime} min
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Avg Delivery Time</span>
                        <span className="text-xs font-semibold text-orange-600">
                          {analytics.avgDeliveryTime} min
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Monthly Growth</span>
                        <span className="text-xs font-semibold text-green-600">
                          +{analytics.monthlyGrowth}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ========== VERIFICATIONS TAB ========== */}
          <TabsContent value="verifications">
            <Card className="border-orange-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-orange-500" />
                  Pending Verifications Queue
                  <Badge variant="secondary" className="ml-auto">
                    {pendingVerifications.length} pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingVerifications.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
                      <CheckCircle2 className="mx-auto h-10 w-10 text-green-400" />
                      <p className="mt-2 text-sm font-medium text-gray-600">All caught up!</p>
                      <p className="text-xs text-muted-foreground">No pending verifications</p>
                    </div>
                  ) : (
                    pendingVerifications.map((user) => (
                      <div
                        key={user.id}
                        className="flex flex-col gap-3 rounded-lg border border-orange-100 bg-orange-50/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-orange-100"
                          />
                          <div>
                            <p className="text-sm font-medium">{user.displayName}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-red-600 border-red-200 hover:bg-red-50">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== SYSTEM TAB ========== */}
          <TabsContent value="system">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Service Status */}
              <Card className="border-orange-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Server className="h-5 w-5 text-orange-500" />
                    System Services Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {systemServices.map((service) => (
                      <div
                        key={service.name}
                        className="flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50/30 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <StatusDot color={service.status} />
                          <service.icon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{service.latency}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${
                              service.status === 'green'
                                ? 'border-green-200 text-green-600'
                                : service.status === 'yellow'
                                ? 'border-yellow-200 text-yellow-600'
                                : 'border-red-200 text-red-600'
                            }`}
                          >
                            {service.status === 'green' ? 'Healthy' : service.status === 'yellow' ? 'Degraded' : 'Down'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Overview */}
              <Card className="border-orange-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="h-5 w-5 text-orange-500" />
                    System Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-lg font-bold text-gray-800">{mockUsers.length.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Records</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-lg font-bold text-gray-800">{mockAuditLogs.length.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Audit Entries</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-lg font-bold text-gray-800">99.9%</p>
                      <p className="text-xs text-muted-foreground">Uptime</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-center">
                      <p className="text-lg font-bold text-gray-800">5ms</p>
                      <p className="text-xs text-muted-foreground">Avg Response</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Active Configurations</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Emergency Mode</span>
                        <StatusDot color={emergencyMode ? 'yellow' : 'green'} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maintenance Mode</span>
                        <StatusDot color={maintenanceMode ? 'red' : 'green'} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">AI Matching</span>
                        <StatusDot color={autoMatch ? 'green' : 'red'} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Real-time Sync</span>
                        <StatusDot color={maintenanceMode ? 'red' : 'green'} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Notifications</span>
                        <StatusDot color="green" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Run Diagnostics
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      View Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
