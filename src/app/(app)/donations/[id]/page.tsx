
'use client';

import { notFound, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { mockDonations } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, MapPin, Utensils, Calendar, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import * as React from 'react';
import { Donation } from '@/lib/types';

export default function DonationDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [donation, setDonation] = React.useState<Donation | undefined | null>(undefined);
  
  React.useEffect(() => {
    if (id) {
      const foundDonation = mockDonations.find((d) => d.id === id);
      setDonation(foundDonation);
    }
  }, [id]);

  if (donation === undefined) {
    return (
        <>
            <Header title="Donation Details" />
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        </>
    )
  }

  if (!donation) {
    notFound();
  }

  return (
    <>
      <Header title="Donation Details" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">{donation.foodName}</CardTitle>
            <CardDescription>
              Donated by {donation.donor.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={donation.donor.photoURL}
                  alt={donation.donor.name}
                />
                <AvatarFallback>
                  {donation.donor.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{donation.donor.name}</p>
                <p className="text-sm text-muted-foreground">
                  {donation.donor.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-base font-medium flex items-center gap-2 text-muted-foreground'>
                            <Phone className='h-4 w-4' />
                            Contact Number
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-lg font-semibold'>{donation.donor.phone}</p>
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
                           Pickup By
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-lg font-semibold'>
                            {donation.pickupBy ? donation.pickupBy.toDate().toLocaleDateString() : 'Not specified'}
                        </p>
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
