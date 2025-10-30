import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockUsers } from '@/lib/data';
import { User } from '@/lib/types';
import { Crown, Medal, Trophy } from 'lucide-react';

const UserRow = ({ user, rank }: { user: User, rank: number }) => {
  const rankIcon = () => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-yellow-700" />;
    return <div className="w-6 text-center font-bold">{rank}</div>;
  }

  return (
    <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted/50">
        <div className="flex items-center justify-center w-8">
            {rankIcon()}
        </div>
        <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="ml-auto font-medium">{user.points} pts</div>
    </div>
  )
};

export default function LeaderboardPage() {
  const topDonors = [...mockUsers].sort((a, b) => b.points - a.points);
  const topVolunteers = [...mockUsers].sort((a, b) => a.points - b.points); // Just for variety

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
                <CardTitle className='font-headline'>Top Donors</CardTitle>
                <CardDescription>
                  Our most generous contributors making a huge impact.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topDonors.map((user, index) => (
                    <UserRow key={user.id} user={user} rank={index + 1} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="volunteers">
          <Card>
              <CardHeader>
                <CardTitle className='font-headline'>Top Volunteers</CardTitle>
                <CardDescription>
                  Dedicated volunteers who power our deliveries.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topVolunteers.map((user, index) => (
                     <UserRow key={user.id} user={user} rank={index + 1} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
