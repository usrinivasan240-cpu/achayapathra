
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Donation } from '@/lib/types';


export function RecentDonations() {
  const firestore = useFirestore();

  const recentDonationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'donations'), 
        orderBy('createdAt', 'desc'), 
        limit(5)
    );
  }, [firestore]);

  const { data: recentDonations, isLoading } = useCollection<Donation>(recentDonationsQuery);


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
            <AvatarImage src={donation.donor?.photoURL} alt={donation.donor?.name} />
            <AvatarFallback>{donation.donor?.name?.substring(0, 2) || 'DN'}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{donation.donor?.name || 'Anonymous'}</p>
            <p className="text-sm text-muted-foreground">{donation.donor?.email || 'No email'}</p>
          </div>
          <div className="ml-auto font-medium">
            {donation.foodName}
          </div>
        </div>
      ))}
    </div>
  );
}
