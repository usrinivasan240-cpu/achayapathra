
'use client';

import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, MapPin, Utensils, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';
import type { Donation } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DonationDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const firestore = useFirestore();

  const donationRef = useMemoFirebase(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'donations', params.id);
  }, [firestore, params.id]);

  const { data: donationData, isLoading } = useDoc<Donation>(donationRef);

  const donation = donationData ? {
      ...donationData,
      expires: (donationData.expires as unknown as Timestamp).toDate(),
  } : null;

  if (isLoading) {
    return (
        <>
        <Header title="Donation Details" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <Card>
                <CardHeader>
                    <Skeleton className='h-8 w-3/4' />
                    <Skeleton className='h-4 w-1/4' />
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div>
                             <Skeleton className='h-6 w-32' />
                             <Skeleton className='h-4 w-48 mt-2' />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className='h-24 w-full' />
                        <Skeleton className='h-24 w-full' />
                        <Skeleton className='h-24 w-full' />
                        <Skeleton className='h-24 w-full' />
                    </div>
                </CardContent>
            </Card>
        </main>
        </>
    )
  }

  if (!donation) {
    notFound();
  }
  
  // A donor field is no longer directly on the donation, we create a mock one from the stored fields
  const donor = {
      name: donation.donorName,
      email: '', // Not stored on donation, can be fetched if needed
      avatarUrl: donation.donorAvatarUrl,
  }

  return (
    <>
      <Header title="Donation Details" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">{donation.foodName}</CardTitle>
            <CardDescription>
              Donated by {donor.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={donor.avatarUrl}
                  alt={donor.name}
                />
                <AvatarFallback>
                  {donor.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{donor.name}</p>
                {/* <p className="text-sm text-muted-foreground">
                  {donor.email}
                </p> */}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-base font-medium flex items-center gap-2 text-muted-foreground'>
                            <Utensils className='h-4 w-4' />
                           Food Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-lg font-semibold'>{donation.foodType}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-base font-medium flex items-center gap-2 text-muted-foreground'>
                           <MapPin className='h-4 w-4' />
                           Pickup Location
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-lg font-semibold'>{donation.location}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-base font-medium flex items-center gap-2 text-muted-foreground'>
                           <Utensils className='h-4 w-4' />
                           Quantity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-lg font-semibold'>{donation.quantity}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-base font-medium flex items-center gap-2 text-muted-foreground'>
                           <Calendar className='h-4 w-4' />
                           Expires On
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-lg font-semibold'>{donation.expires.toLocaleDateString()}</p>
                    </CardContent>
                </Card>
            </div>
             <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <Badge>{donation.status}</Badge>
            </div>

          </CardContent>
        </Card>
      </main>
    </>
  );
}
