'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import {
  User,
  Truck,
  Clock,
  MapPin,
  Award,
  Star,
  Calendar as CalendarIcon,
  TrendingUp,
  Target,
  Flame,
  CheckCircle2,
  Zap,
  Package,
  Navigation,
  Timer,
  Users,
  Trophy,
  ChevronRight,
  Phone,
  Mail,
  Gift,
  Coins,
} from 'lucide-react';
import { mockUsers, mockDonations, mockBadges } from '@/lib/data';
import { UserProfile, Donation } from '@/lib/types';

const XP_PER_LEVEL = 1000;

const getLevelInfo = (xp: number) => {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentLevelXp = xp % XP_PER_LEVEL;
  const progress = (currentLevelXp / XP_PER_LEVEL) * 100;
  return { level, currentLevelXp, progress, nextLevelXp: XP_PER_LEVEL };
};

const mockEarnings = [
  { id: 1, date: '2026-07-29', description: 'Delivery #1247 completed', points: 50, type: 'delivery' },
  { id: 2, date: '2026-07-28', description: 'Streak bonus (7 days)', points: 100, type: 'streak' },
  { id: 3, date: '2026-07-28', description: 'Delivery #1246 completed', points: 50, type: 'delivery' },
  { id: 4, date: '2026-07-27', description: 'Perfect delivery rating', points: 75, type: 'bonus' },
  { id: 5, date: '2026-07-27', description: 'Delivery #1245 completed', points: 50, type: 'delivery' },
  { id: 6, date: '2026-07-26', description: 'Emergency response bonus', points: 150, type: 'bonus' },
  { id: 7, date: '2026-07-26', description: 'Delivery #1244 completed', points: 50, type: 'delivery' },
  { id: 8, date: '2026-07-25', description: 'Delivery #1243 completed', points: 50, type: 'delivery' },
];

const mockSchedule = [
  { day: 'Mon', slots: ['9:00 AM - 12:00 PM', '4:00 PM - 7:00 PM'] },
  { day: 'Tue', slots: ['10:00 AM - 1:00 PM'] },
  { day: 'Wed', slots: ['9:00 AM - 12:00 PM', '4:00 PM - 7:00 PM'] },
  { day: 'Thu', slots: ['11:00 AM - 2:00 PM'] },
  { day: 'Fri', slots: ['9:00 AM - 12:00 PM', '4:00 PM - 7:00 PM'] },
  { day: 'Sat', slots: ['8:00 AM - 1:00 PM'] },
  { day: 'Sun', slots: [] },
];

export default function VolunteerProfilePage() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = React.useState('overview');

  const volunteers = React.useMemo(
    () => mockUsers.filter((u) => u.role === 'volunteer'),
    []
  );

  const volunteer = React.useMemo(() => {
    if (volunteers.length > 0) {
      const sorted = [...volunteers].sort((a, b) => (b.totalDeliveries || 0) - (a.totalDeliveries || 0));
      return sorted[0];
    }
    return null;
  }, [volunteers]);

  const volunteerDonations = React.useMemo(() => {
    if (!volunteer) return [];
    return mockDonations.filter(
      (d) => d.volunteerId === volunteer.id || d.claimedBy === volunteer.id
    ).slice(0, 15);
  }, [volunteer]);

  const deliveredDonations = React.useMemo(
    () => volunteerDonations.filter((d) => d.status === 'Delivered'),
    [volunteerDonations]
  );

  const activeDelivery = React.useMemo(
    () => volunteerDonations.find((d) => d.status === 'Picked Up' || d.status === 'Claimed'),
    [volunteerDonations]
  );

  const earnedBadges = React.useMemo(() => {
    if (!volunteer?.badges) return [];
    return mockBadges.filter((b) => volunteer.badges?.includes(b.id));
  }, [volunteer]);

  const allBadges = mockBadges;

  const levelInfo = React.useMemo(() => {
    if (!volunteer) return getLevelInfo(0);
    return getLevelInfo(volunteer.xp || 0);
  }, [volunteer]);

  const weeklyDeliveries = React.useMemo(() => {
    return deliveredDonations.filter((d) => {
      const created = d.createdAt?.toDate();
      if (!created) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo;
    }).length;
  }, [deliveredDonations]);

  if (!volunteer) {
    return (
      <>
        <Header title="Volunteer Profile" />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">No volunteer data found.</p>
        </main>
      </>
    );
  }

  const efficiency = volunteer.totalDeliveries
    ? Math.round((deliveredDonations.length / Math.max(volunteer.totalDeliveries, 1)) * 100)
    : 0;

  const avgDeliveryTime = 24 + Math.floor(Math.random() * 12);

  const rating = 4.5 + Math.random() * 0.5;

  return (
    <>
      <Header title="Volunteer Profile" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Main Profile Card */}
            <Card className="overflow-hidden">
              <div className="relative h-32 bg-gradient-to-r from-[#FF6B35] to-[#F7931E]">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRhMiAyIDAgMSAxLTQgMCAyIDIgMCAwIDEgNCAwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
              </div>
              <div className="relative px-6 pb-6">
                <div className="flex flex-col items-center -mt-16">
                  <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                    <AvatarImage src={volunteer.photoURL} alt={volunteer.displayName} />
                    <AvatarFallback className="bg-[#FF6B35] text-white text-3xl font-bold">
                      {volunteer.displayName.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-3 text-xl font-bold">{volunteer.displayName}</h2>
                  <p className="text-sm text-muted-foreground">{volunteer.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">
                      <Truck className="h-3 w-3 mr-1" />
                      Volunteer
                    </Badge>
                    {volunteer.verified && (
                      <Badge variant="secondary">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Level & XP */}
                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-[#FF6B35] flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{levelInfo.level}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Level {levelInfo.level}</p>
                        <p className="text-xs text-muted-foreground">Food Rescue Hero</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{volunteer.xp?.toLocaleString()} XP</p>
                      <p className="text-xs text-muted-foreground">{levelInfo.currentLevelXp} / {XP_PER_LEVEL}</p>
                    </div>
                  </div>
                  <Progress value={levelInfo.progress} className="h-2 [&>div]:bg-[#FF6B35]" />
                </div>

                {/* Streak */}
                <div className="mt-4 flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Flame className="h-5 w-5" />
                  <span className="font-bold">{volunteer.streak || 0} Day Streak</span>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-orange-50">
                    <p className="text-2xl font-bold text-[#FF6B35]">{volunteer.totalDeliveries || 0}</p>
                    <p className="text-xs text-muted-foreground">Deliveries</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-orange-50">
                    <p className="text-2xl font-bold text-[#FF6B35]">{volunteer.points?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-orange-50">
                    <p className="text-2xl font-bold text-[#FF6B35]">{volunteer.totalVolunteerHours || 0}h</p>
                    <p className="text-xs text-muted-foreground">Hours</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{volunteer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{volunteer.address}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Achievement Badges */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#FF6B35]" />
                  Badges Earned
                </CardTitle>
                <CardDescription>{earnedBadges.length} of {allBadges.length} badges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {earnedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="group relative flex items-center gap-2 p-2 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                      title={`${badge.name}: ${badge.description}`}
                    >
                      <span className="text-xl">{badge.icon}</span>
                      <span className="text-xs font-medium hidden sm:inline">{badge.name}</span>
                    </div>
                  ))}
                </div>
                {earnedBadges.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No badges earned yet. Keep delivering!</p>
                )}
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-[#FF6B35]" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockSchedule.map((s) => (
                    <div key={s.day} className="flex items-center justify-between text-sm">
                      <span className="font-medium w-10">{s.day}</span>
                      <div className="flex-1 ml-3">
                        {s.slots.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {s.slots.map((slot, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs">
                                {slot}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Off</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Delivery Tracker */}
            {activeDelivery && (
              <Card className="border-[#FF6B35]/30 bg-gradient-to-r from-orange-50 to-amber-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-[#FF6B35] animate-pulse" />
                      Active Delivery
                    </CardTitle>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <span className="h-2 w-2 rounded-full bg-white mr-1 animate-pulse" />
                      In Progress
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold text-lg">{activeDelivery.foodName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{activeDelivery.quantity}</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-[#FF6B35]" />
                          <span className="truncate">{activeDelivery.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Timer className="h-4 w-4 text-[#FF6B35]" />
                          <span>ETA: {12 + Math.floor(Math.random() * 18)} minutes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-[#FF6B35]" />
                          <span>Tracking: {activeDelivery.trackingId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative h-32 w-32">
                        <svg className="h-full w-full" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#FFEDD5" strokeWidth="8" />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke="#FF6B35"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${68} ${214}`}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-[#FF6B35]">68%</span>
                          <span className="text-xs text-muted-foreground">Complete</span>
                        </div>
                      </div>
                      <Button size="sm" className="mt-3 bg-[#FF6B35] hover:bg-[#FF6B35]/90">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark Delivered
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Performance Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-[#FF6B35]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{volunteer.totalDeliveries || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Deliveries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{efficiency}%</p>
                      <p className="text-xs text-muted-foreground">Efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{avgDeliveryTime}m</p>
                      <p className="text-xs text-muted-foreground">Avg Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                      <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{rating.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                {/* Weekly Activity */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-[#FF6B35]" />
                      Weekly Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                        const deliveries = day === 'Sun' ? 0 : Math.floor(Math.random() * 6) + 1;
                        const maxDeliveries = 8;
                        return (
                          <div key={day} className="flex items-center gap-3">
                            <span className="w-8 text-sm font-medium">{day}</span>
                            <div className="flex-1 h-6 bg-orange-50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#FF6B35] to-[#F7931E] rounded-full transition-all duration-500"
                                style={{ width: `${(deliveries / maxDeliveries) * 100}%` }}
                              />
                            </div>
                            <span className="w-8 text-sm text-muted-foreground text-right">{deliveries}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Badges Progress */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-[#FF6B35]" />
                      Badge Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {allBadges
                        .filter((b) => !earnedBadges.find((eb) => eb.id === b.id))
                        .slice(0, 4)
                        .map((badge) => {
                          const progress = Math.floor(Math.random() * 80) + 10;
                          return (
                            <div key={badge.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{badge.icon}</span>
                                  <div>
                                    <p className="text-sm font-medium">{badge.name}</p>
                                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-1.5" />
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>

                {/* Impact Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-5 w-5 text-[#FF6B35]" />
                      Impact Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-lg bg-orange-50">
                        <Users className="h-8 w-8 text-[#FF6B35] mx-auto mb-2" />
                        <p className="text-2xl font-bold">{Math.floor((volunteer.totalDeliveries || 0) * 3.2)}</p>
                        <p className="text-xs text-muted-foreground">People Fed</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-green-50">
                        <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{((volunteer.totalDeliveries || 0) * 2.5).toFixed(0)}kg</p>
                        <p className="text-xs text-muted-foreground">Food Rescued</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-blue-50">
                        <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{((volunteer.totalDeliveries || 0) * 6.25).toFixed(0)}kg</p>
                        <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-purple-50">
                        <Flame className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{volunteer.streak || 0}</p>
                        <p className="text-xs text-muted-foreground">Day Streak</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[#FF6B35]" />
                      Delivery Timeline
                    </CardTitle>
                    <CardDescription>Your recent delivery activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-orange-100" />
                      <div className="space-y-6">
                        {volunteerDonations.slice(0, 10).map((donation, index) => (
                          <div key={donation.id} className="relative flex items-start gap-4">
                            <div className="relative z-10 h-8 w-8 rounded-full bg-white border-2 border-[#FF6B35] flex items-center justify-center flex-shrink-0">
                              <div className={`h-3 w-3 rounded-full ${
                                donation.status === 'Delivered'
                                  ? 'bg-green-500'
                                  : donation.status === 'Picked Up'
                                  ? 'bg-blue-500'
                                  : donation.status === 'Claimed'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-300'
                              }`} />
                            </div>
                            <div className="flex-1 pb-6">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">{donation.foodName}</p>
                                  <p className="text-sm text-muted-foreground">{donation.quantity}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {donation.location.substring(0, 40)}...
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    donation.status === 'Delivered'
                                      ? 'default'
                                      : donation.status === 'Picked Up'
                                      ? 'secondary'
                                      : 'outline'
                                  }
                                  className={
                                    donation.status === 'Delivered'
                                      ? 'bg-green-500 hover:bg-green-600'
                                      : ''
                                  }
                                >
                                  {donation.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                {donation.createdAt?.toDate().toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Earnings Tab */}
              <TabsContent value="earnings" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Coins className="h-5 w-5 text-[#FF6B35]" />
                        Points History
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-[#FF6B35]" />
                        <span className="font-bold text-[#FF6B35]">{volunteer.points?.toLocaleString()} pts</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockEarnings.map((earning) => (
                        <div
                          key={earning.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-orange-50/50 hover:bg-orange-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              earning.type === 'delivery'
                                ? 'bg-[#FF6B35]/10'
                                : earning.type === 'streak'
                                ? 'bg-red-100'
                                : 'bg-yellow-100'
                            }`}>
                              {earning.type === 'delivery' ? (
                                <Truck className="h-4 w-4 text-[#FF6B35]" />
                              ) : earning.type === 'streak' ? (
                                <Flame className="h-4 w-4 text-red-500" />
                              ) : (
                                <Star className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{earning.description}</p>
                              <p className="text-xs text-muted-foreground">{earning.date}</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-green-600">+{earning.points}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Points Breakdown */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Points Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Delivery completions</span>
                        <span className="font-medium">{(volunteer.totalDeliveries || 0) * 50}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Streak bonuses</span>
                        <span className="font-medium">{Math.floor((volunteer.streak || 0) * 3.5)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Rating bonuses</span>
                        <span className="font-medium">{Math.floor((volunteer.totalDeliveries || 0) * 7.5)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Achievement rewards</span>
                        <span className="font-medium">{earnedBadges.length * 200}</span>
                      </div>
                      <div className="border-t pt-3 flex items-center justify-between font-semibold">
                        <span className="text-sm">Total Points</span>
                        <span className="text-[#FF6B35]">{volunteer.points?.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Calendar Tab */}
              <TabsContent value="calendar" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-[#FF6B35]" />
                      Delivery Calendar
                    </CardTitle>
                    <CardDescription>Track your delivery schedule</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-3">
                          {selectedDate
                            ? selectedDate.toLocaleDateString('en-IN', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                              })
                            : 'Select a date'}
                        </h4>
                        <div className="space-y-2">
                          {selectedDate && (() => {
                            const dayName = selectedDate.toLocaleDateString('en-IN', { weekday: 'short' });
                            const schedule = mockSchedule.find((s) => s.day === dayName);
                            const dayDeliveries = deliveredDonations.filter((d) => {
                              const created = d.createdAt?.toDate();
                              return created && created.toDateString() === selectedDate.toDateString();
                            });

                            return (
                              <>
                                {schedule && schedule.slots.length > 0 ? (
                                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                                    <p className="text-sm font-medium text-orange-700">Scheduled Shifts</p>
                                    {schedule.slots.map((slot, i) => (
                                      <p key={i} className="text-sm text-orange-600 mt-1">{slot}</p>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-3 rounded-lg bg-gray-50 border">
                                    <p className="text-sm text-muted-foreground">No shifts scheduled</p>
                                  </div>
                                )}
                                {dayDeliveries.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-sm font-medium">Deliveries: {dayDeliveries.length}</p>
                                    {dayDeliveries.map((d) => (
                                      <div key={d.id} className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span>{d.foodName} - {d.quantity}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Monthly Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-orange-50">
                        <p className="text-3xl font-bold text-[#FF6B35]">{weeklyDeliveries * 4}</p>
                        <p className="text-sm text-muted-foreground">Deliveries</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-green-50">
                        <p className="text-3xl font-bold text-green-500">{volunteer.totalVolunteerHours || 0}</p>
                        <p className="text-sm text-muted-foreground">Hours</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-blue-50">
                        <p className="text-3xl font-bold text-blue-500">{((weeklyDeliveries * 4) * 2.5).toFixed(0)}kg</p>
                        <p className="text-sm text-muted-foreground">Food Rescued</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  );
}
