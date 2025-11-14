
'use client';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/lib/types';
import { Crown, Medal, Trophy } from 'lucide-react';
import React from 'react';
import { mockUsers } from '@/lib/data';

const UserRow = ({ user, rank }: { user: UserProfile; rank: number }) => {
  const rankIcon = () => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-yellow-700" />;
    return <div className="w-6 text-center font-bold">{rank}</div>;
  };

  return (
    <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
      <div className="flex items-center justify-center w-8">{rankIcon()}</div>
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.photoURL} alt={user.displayName} />
        <AvatarFallback>{user.displayName.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="grid gap-1">
        <p className="text-sm font-medium leading-none">{user.displayName}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <div className="ml-auto font-medium">{user.loyaltyPoints} pts</div>
    </div>
  );
};

export default function LeaderboardPage() {
  const topFoodies = [...mockUsers]
    .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
    .slice(0, 10);

  const campusChampions = [...mockUsers]
    .filter((user) => user.notificationPreferences.pushReady)
    .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
    .slice(0, 10);

  return (
    <>
      <Header title="Leaderboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="foodies" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="foodies">Top foodies</TabsTrigger>
            <TabsTrigger value="champions">Campus champions</TabsTrigger>
          </TabsList>
          <TabsContent value="foodies">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Most loyal diners</CardTitle>
                <CardDescription>
                  Students with the highest loyalty points across all canteens.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topFoodies.map((user, index) => (
                  <UserRow key={user.id} user={user} rank={index + 1} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="champions">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Notification-ready champions</CardTitle>
                <CardDescription>
                  Students who opt in for ready alerts and dine frequently.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {campusChampions.length > 0 ? (
                  campusChampions.map((user, index) => (
                    <UserRow key={user.id} user={user} rank={index + 1} />
                  ))
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    No champions recorded yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
