'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Gift, Trophy, Star, Award, Flame, Target, Crown, Medal,
  Lock, CheckCircle2, Sparkles, Zap, TrendingUp, Users
} from 'lucide-react';
import { mockRewards, mockBadges, mockUsers } from '@/lib/data';
import { useLanguage } from '@/contexts/language-context';

const ACHAYA_USER = mockUsers.find(u => u.id === 'admin-001')!;

const LEVELS = Array.from({ length: 50 }, (_, i) => ({
  level: i + 1,
  xpRequired: (i + 1) * 3000,
}));

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span className="tabular-nums">{count.toLocaleString()}</span>;
}

function XPProgressBar({ xp, level }: { xp: number; level: number }) {
  const currentLevelXP = (level - 1) * 3000;
  const nextLevelXP = level * 3000;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-muted-foreground">Level {level}</span>
        <span className="text-primary">{xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</span>
      </div>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted border border-primary/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-black text-white drop-shadow-sm">{Math.round(progress)}%</span>
        </div>
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground font-semibold">
        <span>XP to next level: {Math.max(0, nextLevelXP - xp).toLocaleString()}</span>
        <span>Level {level + 1}</span>
      </div>
    </div>
  );
}

function StreakTracker({ streak }: { streak: number }) {
  const streakMilestones = [
    { days: 7, icon: Flame, label: '7 Days', unlocked: streak >= 7 },
    { days: 30, icon: Zap, label: '30 Days', unlocked: streak >= 30 },
    { days: 100, icon: Target, label: '100 Days', unlocked: streak >= 100 },
    { days: 365, icon: Crown, label: '365 Days', unlocked: streak >= 365 },
  ];

  return (
    <Card className="overflow-hidden border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          Streak Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="inline-flex items-baseline gap-1">
            <span className="text-4xl font-black text-orange-600"><AnimatedCounter target={streak} /></span>
            <span className="text-sm font-bold text-orange-500">days</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-semibold mt-1">Keep going! Don&apos;t break the streak.</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {streakMilestones.map((m) => (
            <div
              key={m.days}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                m.unlocked
                  ? 'bg-orange-500/10 border border-orange-300 shadow-sm'
                  : 'bg-muted/50 border border-transparent opacity-50'
              }`}
            >
              <m.icon className={`h-4 w-4 ${m.unlocked ? 'text-orange-500' : 'text-muted-foreground'}`} />
              <span className="text-[8px] font-bold uppercase">{m.label}</span>
              {m.unlocked ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <Lock className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PointsBalanceCard({ points, level }: { points: number; level: number }) {
  return (
    <Card className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      <CardHeader className="pb-2 relative">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Points Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black tabular-nums"><AnimatedCounter target={points} /></span>
          <span className="text-sm font-bold text-white/70">pts</span>
        </div>
        <div className="flex items-center gap-2 text-white/80">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-[10px] px-2 py-0.5">
            Level {level}
          </Badge>
          <span className="text-[10px] font-semibold">Top 1% of contributors</span>
        </div>
        <Button
          variant="secondary"
          className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs font-bold w-full"
        >
          <Gift className="h-4 w-4 mr-2" />
          Redeem Points
        </Button>
      </CardContent>
    </Card>
  );
}

function RewardCard({ reward }: { reward: (typeof mockRewards)[0] }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const categoryColors: Record<string, string> = {
    voucher: 'bg-blue-500/10 text-blue-600 border-blue-200',
    gift: 'bg-purple-500/10 text-purple-600 border-purple-200',
    discount: 'bg-green-500/10 text-green-600 border-green-200',
    recognition: 'bg-amber-500/10 text-amber-600 border-amber-200',
  };

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 cursor-pointer border ${
        isHovered ? 'shadow-lg scale-[1.02] border-orange-300' : 'shadow-sm border-border hover:shadow-md'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`h-2 w-full bg-gradient-to-r from-orange-400 to-amber-400 ${isHovered ? 'h-3' : ''} transition-all`} />
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-bold leading-tight">{reward.name}</CardTitle>
          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 shrink-0 ${categoryColors[reward.category] || ''}`}>
            {reward.category}
          </Badge>
        </div>
        <CardDescription className="text-[10px] leading-snug">{reward.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
            <span className="text-sm font-black text-orange-600">{reward.pointsRequired.toLocaleString()}</span>
            <span className="text-[9px] text-muted-foreground font-semibold">pts</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-semibold">
            <span>{reward.stock} left</span>
          </div>
        </div>
        {reward.partner && (
          <div className="text-[9px] text-muted-foreground font-semibold">
            Partner: <span className="text-foreground">{reward.partner}</span>
          </div>
        )}
        <Button
          size="sm"
          className={`w-full text-[10px] font-bold uppercase tracking-wider ${
            isHovered ? 'bg-orange-500 hover:bg-orange-600' : ''
          }`}
        >
          <Gift className="h-3.5 w-3.5 mr-1" />
          Redeem Now
        </Button>
      </CardContent>
    </Card>
  );
}

function BadgeCard({ badge, earned }: { badge: (typeof mockBadges)[0]; earned: boolean }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 ${
        earned
          ? `border-2 shadow-sm hover:shadow-md ${isHovered ? 'scale-[1.02]' : ''}`
          : 'opacity-60 grayscale border border-dashed'
      }`}
      style={{ borderColor: earned ? badge.color : undefined }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-transform ${
            earned && isHovered ? 'scale-110' : ''
          }`}
          style={{ backgroundColor: earned ? `${badge.color}20` : '#f3f4f6' }}
        >
          {earned ? badge.icon : <Lock className="h-5 w-5 text-gray-400" />}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold">{badge.name}</p>
          <p className="text-[9px] text-muted-foreground leading-snug">{badge.description}</p>
        </div>
        {earned && (
          <Badge variant="secondary" className="text-[8px] px-1.5 py-0" style={{ backgroundColor: `${badge.color}20`, color: badge.color }}>
            +{badge.xpReward} XP
          </Badge>
        )}
        {!earned && (
          <Badge variant="outline" className="text-[8px] px-1.5 py-0">
            {badge.requirement}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

const ACHIEVEMENTS = [
  { id: 'ach-001', title: 'First Donation', desc: 'Made your very first food donation', progress: 1, max: 1, icon: Gift, color: '#FF6B35' },
  { id: 'ach-002', title: 'Donation Streak Master', desc: 'Maintained a 30-day donation streak', progress: 30, max: 30, icon: Flame, color: '#E91E63' },
  { id: 'ach-003', title: 'Carbon Warrior', desc: 'Saved 5000kg of CO₂ emissions', progress: 4200, max: 5000, icon: Award, color: '#4CAF50' },
  { id: 'ach-004', title: 'Community Builder', desc: 'Referred 10 new donors to the platform', progress: 7, max: 10, icon: Users, color: '#2196F3' },
  { id: 'ach-005', title: 'Meal Millionaire', desc: 'Helped serve 100,000 meals total', progress: 85000, max: 100000, icon: Trophy, color: '#FF9800' },
  { id: 'ach-006', title: 'Zone Conqueror', desc: 'Donated to all 30 districts in Tamil Nadu', progress: 22, max: 30, icon: Target, color: '#9C27B0' },
];

function AchievementCard({ achievement }: { achievement: (typeof ACHIEVEMENTS)[0] }) {
  const pct = Math.round((achievement.progress / achievement.max) * 100);
  const isComplete = pct >= 100;
  const Icon = achievement.icon;

  return (
    <Card className={`overflow-hidden ${isComplete ? 'border-green-300 bg-green-50/50' : 'border-border'}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${achievement.color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color: achievement.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold truncate">{achievement.title}</p>
              {isComplete && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
            </div>
            <p className="text-[9px] text-muted-foreground leading-snug mt-0.5">{achievement.desc}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] font-bold">
            <span className="text-muted-foreground">{achievement.progress.toLocaleString()} / {achievement.max.toLocaleString()}</span>
            <span style={{ color: achievement.color }}>{pct}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${pct}%`, backgroundColor: achievement.color }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LeaderboardMiniView() {
  const topDonors = React.useMemo(
    () => [...mockUsers].filter(u => u.role === 'donor').sort((a, b) => b.points - a.points).slice(0, 5),
    []
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-4 w-4 text-orange-500" />
            Top Donors
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase h-7 px-2">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {topDonors.map((user, index) => {
          const rankIcon = index === 0 ? Crown : index === 1 ? Medal : index === 2 ? Trophy : null;
          return (
            <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-7 flex items-center justify-center">
                {rankIcon ? (
                  React.createElement(rankIcon, { className: `h-4 w-4 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-yellow-700'}` })
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
                )}
              </div>
              <Avatar className="h-8 w-8 border shadow-sm">
                <AvatarImage src={user.photoURL} alt={user.displayName} />
                <AvatarFallback className="bg-orange-100 text-orange-600 text-[10px] font-bold">
                  {user.displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{user.displayName}</p>
                <p className="text-[9px] text-muted-foreground">Level {user.level}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-orange-600">{user.points.toLocaleString()}</p>
                <p className="text-[8px] text-muted-foreground font-semibold">PTS</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function RewardsPage() {
  const { t } = useLanguage();
  const user = ACHAYA_USER;
  const userBadgeIds = new Set(user.badges || []);
  const earnedBadges = mockBadges.filter(b => userBadgeIds.has(b.id));
  const lockedBadges = mockBadges.filter(b => !userBadgeIds.has(b.id));

  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
          50% { box-shadow: 0 0 20px 5px rgba(249, 115, 22, 0.15); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>
      <Header title="Rewards & Gamification" />
      <main className="flex-1 pb-20">
        <div className="p-4 md:p-8 space-y-6">

          {/* Top Stats Row */}
          <div className="grid gap-4 md:grid-cols-3">
            <PointsBalanceCard points={user.points} level={user.level || 1} />

            <Card className="md:col-span-2 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    Level Progress
                  </CardTitle>
                  <Badge variant="outline" className="text-[9px] px-2 py-0.5 animate-pulse-glow">
                    <Zap className="h-3 w-3 mr-1 text-orange-500" />
                    Level {user.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <XPProgressBar xp={user.xp || 0} level={user.level || 1} />
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-black text-orange-600"><AnimatedCounter target={user.totalDonations || 0} /></p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Donations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-orange-600"><AnimatedCounter target={user.totalVolunteerHours || 0} /></p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Vol. Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-orange-600"><AnimatedCounter target={earnedBadges.length} /></p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Badges</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Streak + Leaderboard Row */}
          <div className="grid gap-4 md:grid-cols-2">
            <StreakTracker streak={user.streak || 0} />
            <LeaderboardMiniView />
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="rewards" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl">
              <TabsTrigger value="rewards" className="text-[10px] md:text-xs font-bold uppercase py-2.5">
                <Gift className="h-3.5 w-3.5 mr-1.5" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="badges" className="text-[10px] md:text-xs font-bold uppercase py-2.5">
                <Award className="h-3.5 w-3.5 mr-1.5" />
                Badges
              </TabsTrigger>
              <TabsTrigger value="achievements" className="text-[10px] md:text-xs font-bold uppercase py-2.5">
                <Trophy className="h-3.5 w-3.5 mr-1.5" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-[10px] md:text-xs font-bold uppercase py-2.5">
                <Crown className="h-3.5 w-3.5 mr-1.5" />
                Leaderboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rewards" className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mockRewards.map(reward => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="badges" className="mt-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Earned ({earnedBadges.length})</h3>
                </div>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {earnedBadges.map(badge => (
                    <BadgeCard key={badge.id} badge={badge} earned={true} />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Locked ({lockedBadges.length})</h3>
                </div>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {lockedBadges.map(badge => (
                    <BadgeCard key={badge.id} badge={badge} earned={false} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ACHIEVEMENTS.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-orange-500" />
                    Global Leaderboard
                  </CardTitle>
                  <CardDescription className="text-[10px] font-semibold uppercase tracking-wider">
                    Top contributors across all categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  {[...mockUsers]
                    .sort((a, b) => b.points - a.points)
                    .slice(0, 15)
                    .map((user, index) => {
                      const rankIcon = index === 0 ? Crown : index === 1 ? Medal : index === 2 ? Trophy : null;
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            user.id === ACHAYA_USER.id
                              ? 'bg-orange-50 border border-orange-200'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="w-8 flex items-center justify-center">
                            {rankIcon ? (
                              React.createElement(rankIcon, {
                                className: `h-5 w-5 ${
                                  index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-yellow-700'
                                }`
                              })
                            ) : (
                              <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                            )}
                          </div>
                          <Avatar className="h-10 w-10 border shadow-sm">
                            <AvatarImage src={user.photoURL} alt={user.displayName} />
                            <AvatarFallback className="bg-orange-100 text-orange-600 text-xs font-bold">
                              {user.displayName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold truncate">{user.displayName}</p>
                              {user.id === ACHAYA_USER.id && (
                                <Badge variant="outline" className="text-[8px] px-1 py-0 bg-orange-100 text-orange-600 border-orange-300">
                                  YOU
                                </Badge>
                              )}
                            </div>
                            <p className="text-[9px] text-muted-foreground font-semibold">
                              Level {user.level} &middot; {user.totalDonations || 0} donations
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-orange-600">{user.points.toLocaleString()}</p>
                            <p className="text-[8px] text-muted-foreground font-semibold uppercase tracking-wider">PTS</p>
                          </div>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </main>
    </>
  );
}
