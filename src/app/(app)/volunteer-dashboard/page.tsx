
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { MapPin, Loader2, Utensils, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Donation } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

type LocationState = {
  city: string;
  state: string;
  coords?: {
    latitude: number;
    longitude: number;
  };
};

type DonationWithDistance = Donation & {
  distance: number;
};

// Haversine formula to calculate distance between two lat/lng points
const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export default function VolunteerDashboardPage() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [isUpdating, setIsUpdating] = useState(true);
  const [nearbyDonations, setNearbyDonations] = useState<
    DonationWithDistance[]
  >([]);
  const { toast } = useToast();
  const firestore = useFirestore();

  const availableDonationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'donations'), where('status', '==', 'Available'));
  }, [firestore]);

  const { data: availableDonations } = useCollection<Donation>(availableDonationsQuery);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
      });
      setIsUpdating(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setLocation({
          city: 'Current Location',
          state: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
          coords: { latitude, longitude },
        });

        if (isUpdating) {
            toast({
              title: 'Location Found',
              description: 'Now tracking your live location for nearby donations.',
            });
        }
        setIsUpdating(false);
      },
      (error) => {
        setIsUpdating(false);
        if (location === null) {
          toast({
            variant: 'destructive',
            title: 'Geolocation Error',
            description:
              'Could not retrieve your location. Please ensure you have granted location permissions.',
          });
        }
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isUpdating, location, toast]);


  useEffect(() => {
    if (location?.coords && availableDonations) {
        const donationsWithDistance = availableDonations
          .map((donation) => {
            const distance = getDistance(
              location.coords!.latitude,
              location.coords!.longitude,
              donation.lat!,
              donation.lng!
            );
            return { ...donation, distance };
          })
          .sort((a, b) => a.distance - b.distance);

        setNearbyDonations(donationsWithDistance);
    }
  }, [location, availableDonations]);

  const getDirectionsUrl = (donation: Donation) => {
    if (!location?.coords || !donation.lat || !donation.lng) return `https://www.google.com/maps/search/?api=1&query=${donation.location}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${location.coords.latitude},${location.coords.longitude}&destination=${donation.lat},${donation.lng}`;
  }

  return (
    <>
      <Header title="Volunteer Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Your Live Location</CardTitle>
                <CardDescription>
                  Your location updates in real-time to find the nearest tasks.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {isUpdating ? (
                    <div className='flex items-center gap-2 text-muted-foreground'>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Getting your location...</span>
                    </div>
                ) : location ? (
                    <>
                    <div className="flex items-center gap-4">
                        <MapPin className="h-8 w-8 text-primary" />
                        <div>
                        <p className="font-semibold text-lg">{location.city}</p>
                        <p className="text-muted-foreground">{location.state}</p>
                        </div>
                    </div>
                    
                    <Link
                        href={`https://www.google.com/maps/search/?api=1&query=${location.coords?.latitude},${location.coords?.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button variant="link" className="p-0">
                        View on Google Maps
                        </Button>
                    </Link>
                    </>
                ) : (
                    <p className='text-destructive'>Location access denied.</p>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">
                  Nearby Pickup Locations
                </CardTitle>
                <CardDescription>
                  Available donations near you, sorted by distance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isUpdating ? (
                    <div className="text-center text-muted-foreground py-12">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p>Waiting for your location...</p>
                    </div>
                ) : nearbyDonations.length > 0 ? (
                  nearbyDonations.map((donation, index) => (
                    <div key={donation.id}>
                      {index > 0 && <Separator />}
                      <div className="flex items-center gap-4 py-4">
                        <Utensils className="h-6 w-6 text-primary" />
                        <div className="flex-1 grid gap-1">
                          <p className="font-semibold">{donation.foodName}</p>
                          <p className="text-sm text-muted-foreground">
                            {donation.location}
                          </p>
                           <p className="text-sm">Quantity: {donation.quantity}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-2">
                            {donation.distance.toFixed(2)} km away
                          </Badge>
                          <Button size="sm" asChild>
                            <Link href={getDirectionsUrl(donation)} target="_blank" rel="noopener noreferrer">
                                <Map className='mr-2 h-4 w-4' />
                                View Route
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <p>
                      No available donations found near your location.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
