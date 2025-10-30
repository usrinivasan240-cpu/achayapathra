'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type LocationState = {
  city: string;
  state: string;
  coords?: {
    latitude: number;
    longitude: number;
  };
};

export default function VolunteerDashboardPage() {
  const [location, setLocation] = useState<LocationState>({ city: 'Coimbatore', state: 'Tamil Nadu' });
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
      });
      return;
    }

    setIsUpdating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // In a real app, you would use a reverse geocoding service here.
        // For this demo, we'll just display the coordinates and a placeholder name.
        setLocation({
          city: 'Current Location',
          state: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
          coords: { latitude, longitude },
        });
        setIsUpdating(false);
        toast({
          title: 'Location Updated',
          description: 'Your current location has been successfully updated.',
        });
      },
      (error) => {
        setIsUpdating(false);
        toast({
          variant: 'destructive',
          title: 'Geolocation Error',
          description: 'Could not retrieve your location. Please ensure you have granted location permissions.',
        });
        console.error('Geolocation error:', error);
      }
    );
  };

  return (
    <>
      <Header title="Volunteer Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline">Donation Board</CardTitle>
              <CardDescription>
                Available and claimed donations ready for pickup and delivery.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className='flex justify-center items-center h-48'>
                    <p className='text-muted-foreground'>No donations currently assigned.</p>
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Your Location</CardTitle>
               <CardDescription>
                Your current assigned area for deliveries.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-semibold text-lg">{location.city}</p>
                  <p className="text-muted-foreground">{location.state}</p>
                </div>
              </div>
              <Button onClick={handleUpdateLocation} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Location'
                )}
              </Button>
              {location.coords && (
                 <Link href={`https://www.google.com/maps/search/?api=1&query=${location.coords.latitude},${location.coords.longitude}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="link" className="p-0">View on Google Maps</Button>
                 </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
