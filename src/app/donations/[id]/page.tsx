'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import {
  Loader2,
  Utensils,
  MapPin,
  Calendar,
  Package,
  User,
  Clock,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { Donation } from '@/lib/types';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DonationDetailsPage() {
  const params = useParams();
  const { id } = params;
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isClaiming, setIsClaiming] = React.useState(false);


  const donationDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'donations', id as string);
  }, [firestore, id]);

  const {
    data: donation,
    isLoading,
    error,
  } = useDoc<Donation>(donationDocRef);

  const handleClaimDonation = async () => {
    if (!firestore || !user || !id) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to claim a donation.',
        });
        return;
    };
    setIsClaiming(true);
    try {
        const donationRef = doc(firestore, 'donations', id as string);
        await updateDoc(donationRef, { status: 'Claimed', claimedBy: user.uid });
        toast({
            title: 'Donation Claimed!',
            description: 'You have successfully claimed the donation.',
        });
        // The onSnapshot listener in useDoc will update the UI automatically
    } catch (error) {
        console.error('Error claiming donation:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not claim the donation.',
        });
    } finally {
        setIsClaiming(false);
    }
  }

  const toDate = (timestamp: Timestamp | undefined) => {
    return timestamp instanceof Timestamp ? timestamp.toDate() : undefined;
  };

  if (isLoading) {
    return (
      <>
        <Header title="Donation Details" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Error" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-destructive">
            Error loading donation: {error.message}
          </p>
        </div>
      </>
    );
  }

  if (!donation) {
    return (
      <>
        <Header title="Not Found" />
        <div className="flex flex-1 items-center justify-center">
          <p>Donation not found.</p>
        </div>
      </>
    );
  }

  const getDirectionsUrl = (donation: Donation) => {
    if (!donation.lat || !donation.lng)
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        donation.location
      )}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${donation.lat},${donation.lng}`;
  };
  
  const isAiSafe = donation.aiImageAnalysis?.toLowerCase().includes('safe');
  const cookedTime = toDate(donation.cookedTime);
  const pickupBy = toDate(donation.pickupBy);


  return (
    <>
      <Header title="Donation Details" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-8">
            <Card>
                {donation.imageURL && (
                    <div className="relative w-full h-64">
                         <Image src={donation.imageURL} alt={donation.foodName} fill style={{ objectFit: 'cover' }} className="rounded-t-lg" />
                    </div>
                )}
              <CardHeader className={donation.imageURL ? 'pt-6' : ''}>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-headline text-3xl">
                    {donation.foodName}
                  </CardTitle>
                  <Badge variant={donation.status === 'Available' ? 'default' : 'secondary'}>{donation.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                 {donation.aiImageAnalysis && (
                  <Alert variant={isAiSafe ? 'default' : 'destructive'} className="mb-6 bg-opacity-20">
                    {isAiSafe ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                    <AlertTitle>AI Food Safety Analysis</AlertTitle>
                    <AlertDescription>
                      {donation.aiImageAnalysis}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="flex items-start gap-3">
                        <Package className="h-5 w-5 text-primary mt-1" />
                        <div>
                            <p className="font-semibold">Quantity</p>
                            <p className="text-muted-foreground">{donation.quantity}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Utensils className="h-5 w-5 text-primary mt-1" />
                        <div>
                            <p className="font-semibold">Food Type</p>
                            <p className="text-muted-foreground">{donation.foodType || 'Not specified'}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-primary mt-1" />
                        <div>
                            <p className="font-semibold">Cooked Time</p>
                            <p className="text-muted-foreground">{cookedTime ? cookedTime.toLocaleTimeString() : 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-1" />
                        <div>
                            <p className="font-semibold">Pickup By</p>
                            <p className="text-muted-foreground">{pickupBy ? pickupBy.toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {donation.description && (
                    <>
                     <Separator className="my-6" />
                      <div>
                        <h4 className="font-semibold mb-2">Description</h4>
                        <p className="text-muted-foreground text-sm">{donation.description}</p>
                      </div>
                    </>
                )}

                <Separator className="my-6" />

                <div>
                    <h4 className="font-semibold mb-4">Donated By</h4>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={donation.donor?.photoURL} />
                            <AvatarFallback>{donation.donor?.name?.substring(0,2) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{donation.donor?.name || 'Anonymous'}</p>
                            <p className="text-sm text-muted-foreground">{donation.donor?.email}</p>
                        </div>
                    </div>
                </div>


              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Pickup Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <MapPin className="h-8 w-8 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">{donation.location}</p>
                     <Button variant="link" asChild className="p-0 h-auto">
                        <Link href={getDirectionsUrl(donation)} target="_blank" rel="noopener noreferrer">
                            Get Directions
                        </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

             {donation.status === 'Available' && (
                <Button size="lg" className="w-full" onClick={handleClaimDonation} disabled={isClaiming}>
                    {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isClaiming ? 'Claiming...' : 'Claim This Donation'}
                </Button>
            )}
             {donation.status === 'Claimed' && (
                 <p className='text-center text-muted-foreground'>This donation has been claimed.</p>
             )}
          </div>
        </div>
      </main>
    </>
  );
}

    