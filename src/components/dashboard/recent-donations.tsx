import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockUsers } from '@/lib/data';

export function RecentDonations() {
  const recentDonors = mockUsers.slice(0, 5);

  return (
    <div className="space-y-8">
      {recentDonors.map((user) => (
        <div className="flex items-center" key={user.id}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="ml-auto font-medium">
            +{Math.floor(Math.random() * 500) + 50} pts
          </div>
        </div>
      ))}
    </div>
  );
}
