
'use client';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from '@/components/ui/avatar';
  import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
  import { collection, query, where, orderBy, limit } from 'firebase/firestore';
  import { Donation } from '@/lib/types';
  import { Skeleton } from '@/components/ui/skeleton';
  
  export function RecentDonations() {
    const { user } = useUser();
    const firestore = useFirestore();

    const donationsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'donations'), 
            where('donorId', '==', user.uid),
            orderBy('expires', 'desc'),
            limit(5)
        );
    }, [firestore, user]);

    const { data: donations, isLoading } = useCollection<Donation>(donationsQuery);

    if (isLoading) {
        return (
            <div className="space-y-8">
                {[...Array(5)].map((_, i) => (
                    <div className="flex items-center" key={i}>
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="ml-4 space-y-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-[150px]" />
                        </div>
                         <Skeleton className="ml-auto h-5 w-12" />
                    </div>
                ))}
            </div>
        )
    }

    if (!donations || donations.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No recent donations.</p>
        </div>
      )
    }
  
    return (
      <div className="space-y-8">
        {donations.map((donation) => (
          <div className="flex items-center" key={donation.id}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={donation.donorAvatarUrl} alt="Avatar" />
              <AvatarFallback>{donation.donorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{donation.donorName}</p>
              <p className="text-sm text-muted-foreground">
                Donated {donation.foodName}
              </p>
            </div>
            <div className="ml-auto font-medium">{donation.quantity}</div>
          </div>
        ))}
      </div>
    );
  }
  