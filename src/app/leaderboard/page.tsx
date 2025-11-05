
'use client';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/lib/types';
import { Crown, Medal, Trophy, Loader2 } from 'lucide-react';
import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';

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
      <div className="ml-auto font-medium">{user.points} pts</div>
    </div>
  );
};

export default function LeaderboardPage() {
    const firestore = useFirestore();

    const topDonorsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'users'),
            orderBy('points', 'desc'),
            limit(10)
        );
    }, [firestore]);

    const { data: topDonors, isLoading: donorsLoading } = useCollection<UserProfile>(topDonorsQuery);

    const topVolunteersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // This is a placeholder, as we don't have a separate volunteer score.
        // In a real app, you might have a 'volunteerPoints' field.
        return query(
            collection(firestore, 'users'),
            where('role', '==', 'volunteer'),
            orderBy('points', 'desc'),
            limit(10)
        );
    }, [firestore]);

    const { data: topVolunteers, isLoading: volunteersLoading } = useCollection<UserProfile>(topVolunteersQuery);

    const isLoading = donorsLoading || volunteersLoading;


  return (
    <>
      <Header title="Leaderboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="donors" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="donors">Top Donors</TabsTrigger>
            <TabsTrigger value="volunteers">Top Volunteers</TabsTrigger>
          </TabsList>
          <TabsContent value="donors">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Top Donors</CardTitle>
                <CardDescription>
                  Our most generous contributors making a huge impact.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  topDonors?.map((user, index) => (
                    <UserRow key={user.id} user={user} rank={index + 1} />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="volunteers">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Top Volunteers</CardTitle>
                <CardDescription>
                  Dedicated volunteers who power our deliveries.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                    topVolunteers && topVolunteers.length > 0 ? (
                        topVolunteers?.map((user, index) => (
                            <UserRow key={user.id} user={user} rank={index + 1} />
                        ))
                    ) : <p className="text-center text-muted-foreground py-8">No volunteer data available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
