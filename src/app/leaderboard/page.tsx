'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/lib/types';
import { Crown, Medal, Trophy, Loader2, MapPin, Building2, UserCircle } from 'lucide-react';
import { mockUsers, mockCities } from '@/lib/data';
import { useLanguage } from '@/contexts/language-context';

const LeaderboardRow = ({ 
  title, 
  subtitle, 
  value, 
  unit, 
  rank, 
  imageURL, 
  icon: Icon 
}: { 
  title: string; 
  subtitle: string; 
  value: number; 
  unit: string; 
  rank: number; 
  imageURL?: string;
  icon?: React.ElementType;
}) => {
  const rankIcon = () => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-yellow-700" />;
    return <div className="w-6 text-center font-bold text-muted-foreground">{rank}</div>;
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-muted">
      <div className="flex items-center justify-center w-8">{rankIcon()}</div>
      <Avatar className="h-10 w-10 border shadow-sm">
        {imageURL ? (
          <AvatarImage src={imageURL} alt={title} />
        ) : (
          <AvatarFallback className="bg-primary/5 text-primary">
            {Icon ? <Icon className="h-5 w-5" /> : title.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="grid gap-0.5 flex-1 min-w-0">
        <p className="text-sm font-bold truncate leading-tight">{title}</p>
        <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider font-semibold">{subtitle}</p>
      </div>
      <div className="text-right">
        <p className="font-black text-primary text-sm">{value.toLocaleString()}</p>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{unit}</p>
      </div>
    </div>
  );
};

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const isLoading = false; // Using static mock data

  const donors = React.useMemo(() => 
    [...mockUsers]
      .filter(u => u.role === 'donor')
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
  , []);

  const volunteers = React.useMemo(() => 
    [...mockUsers]
      .filter(u => u.role === 'volunteer')
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
  , []);

  const ngos = React.useMemo(() => 
    [...mockUsers]
      .filter(u => u.role === 'ngo')
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
  , []);

  const cities = React.useMemo(() => 
    [...mockCities]
      .sort((a, b) => b.impact - a.impact)
  , []);

  if (isLoading) {
    return (
      <>
        <Header title={t('leaderboard.title')} />
        <div className="flex flex-1 items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t('leaderboard.title')} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="donors" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl overflow-x-auto whitespace-nowrap">
            <TabsTrigger value="donors" className="text-[10px] md:text-xs font-bold uppercase py-2.5">{t('leaderboard.donors')}</TabsTrigger>
            <TabsTrigger value="ngos" className="text-[10px] md:text-xs font-bold uppercase py-2.5">{t('leaderboard.ngos')}</TabsTrigger>
            <TabsTrigger value="volunteers" className="text-[10px] md:text-xs font-bold uppercase py-2.5">{t('leaderboard.volunteers')}</TabsTrigger>
            <TabsTrigger value="cities" className="text-[10px] md:text-xs font-bold uppercase py-2.5">{t('leaderboard.cities')}</TabsTrigger>
          </TabsList>

          <TabsContent value="donors" className="mt-6">
            <Card className="shadow-sm border-none bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="font-headline text-2xl">{t('leaderboard.donors')}</CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Top Individual and Corporate Contributors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {donors.map((user, index) => (
                  <LeaderboardRow 
                    key={user.id} 
                    title={user.displayName} 
                    subtitle={user.address} 
                    value={user.points} 
                    unit={t('leaderboard.pts')} 
                    rank={index + 1} 
                    imageURL={user.photoURL}
                    icon={UserCircle}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ngos" className="mt-6">
            <Card className="shadow-sm border-none bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="font-headline text-2xl">{t('leaderboard.ngos')}</CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Verified Redistribution Partners</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {ngos.map((user, index) => (
                  <LeaderboardRow 
                    key={user.id} 
                    title={user.displayName} 
                    subtitle={user.address} 
                    value={user.points} 
                    unit={t('leaderboard.meals')} 
                    rank={index + 1} 
                    imageURL={user.photoURL}
                    icon={Building2}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volunteers" className="mt-6">
            <Card className="shadow-sm border-none bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="font-headline text-2xl">{t('leaderboard.volunteers')}</CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Logistics and Delivery Heroes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {volunteers.map((user, index) => (
                  <LeaderboardRow 
                    key={user.id} 
                    title={user.displayName} 
                    subtitle={user.address} 
                    value={user.points} 
                    unit={t('leaderboard.pts')} 
                    rank={index + 1} 
                    imageURL={user.photoURL}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cities" className="mt-6">
            <Card className="shadow-sm border-none bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="font-headline text-2xl">{t('leaderboard.cities')}</CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Regional Performance and Efficiency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {cities.map((city, index) => (
                  <LeaderboardRow 
                    key={city.name} 
                    title={city.name} 
                    subtitle={`Rescued: ${city.rescued} kg`} 
                    value={city.impact} 
                    unit={t('leaderboard.meals')} 
                    rank={index + 1} 
                    icon={MapPin}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
