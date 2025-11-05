'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockDonations } from '@/lib/data';
import React from 'react';
import { Loader2 } from 'lucide-react';

export function RecentDonations() {
  const [isLoading, setIsLoading] = React.useState(true);

  // Sort donations by date and take the first 5
  const recentDonations = [...mockDonations]
    .sort((a, b) => b.pickupBy.toMillis() - a.pickupBy.toMillis())
    .slice(0, 5);

  React.useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-40">
            <Loader2 className="h-6 w-6 animate-spin" />
        </div>
    )
  }

  if (!recentDonations || recentDonations.length === 0) {
    return (
        <div className="flex justify-center items-center h-40">
            <p className="text-sm text-muted-foreground">No recent donations.</p>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      {recentDonations.map((donation) => (
        <div className="flex items-center" key={donation.id}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={donation.donor.photoURL} alt={donation.donor.name} />
            <AvatarFallback>{donation.donor.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{donation.donor.name}</p>
            <p className="text-sm text-muted-foreground">{donation.donor.email}</p>
          </div>
          <div className="ml-auto font-medium">
            {donation.foodName}
          </div>
        </div>
      ))}
    </div>
  );
}
