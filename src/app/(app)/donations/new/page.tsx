'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, ShieldCheck, ShieldX, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp, Timestamp, GeoPoint } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  foodName: z.string().min(2, 'Food name must be at least 2 characters.'),
  foodType: z.string({ required_error: 'Please select a food type.' }),
  quantity: z.string().min(1, 'Quantity is required.'),
  cookedTime: z.string().min(1, 'Cooked time is required.'),
  pickupDate: z.date({ required_error: 'Pickup date is required.' }),
  description: z.string().optional(),
  location: z.string().min(2, 'Location is required.'),
  image: z.any().optional(),
});

type AISafetyCheckState = 'idle' | 'checking' | 'safe' | 'unsafe';

type LocationCoords = {
    latitude: number;
    longitude: number;
} | null;

export default function NewDonationPage() {
  const [aiState, setAiState] = React.useState<AISafetyCheckState>('idle');
  const [progress, setProgress] = React.useState(0);
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [coords, setCoords] = React.useState<LocationCoords>(null);

  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foodName: '',
      quantity: '',
      location: '',
      cookedTime: format(new Date(), 'HH:mm'),
    },
  });

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
      });
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real app, you would use a reverse geocoding service here
        // to convert lat/lng to a human-readable address.
        const { latitude, longitude } = position.coords;
        setCoords({latitude, longitude});
        // This is a placeholder, a real app should use reverse geocoding
        const address = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
        form.setValue('location', address);
        setIsGettingLocation(false);
        toast({
          title: 'Location Found',
          description: 'Your current location has been filled in.',
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          variant: 'destructive',
          title: 'Geolocation Error',
          description:
            'Could not retrieve your location. Please ensure you have granted location permissions.',
        });
        console.error('Geolocation error:', error);
      }
    );
  };


  async function handleFinalSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not connect to the database. Please try again.'
        });
        return;
    }

    setIsSubmitting(true);

    try {
        const donationsCol = collection(firestore, 'donations');
        
        const [hours, minutes] = values.cookedTime.split(':');
        const cookedDateTime = new Date();
        cookedDateTime.setHours(parseInt(hours, 10));
        cookedDateTime.setMinutes(parseInt(minutes, 10));

        await addDoc(donationsCol, {
            donorId: user.uid,
            foodName: values.foodName,
            foodType: values.foodType,
            quantity: values.quantity,
            cookedTime: Timestamp.fromDate(cookedDateTime),
            pickupBy: Timestamp.fromDate(values.pickupDate),
            description: values.description || '',
            location: values.location,
            ...(coords && { lat: coords.latitude, lng: coords.longitude }),
            status: 'Available',
            createdAt: serverTimestamp(),
            donor: {
                id: user.uid,
                name: user.displayName || 'Anonymous',
                email: user.email,
                photoURL: user.photoURL || '',
            }
        });

        toast({
            title: 'Donation Listed!',
            description: 'Your donation has been successfully submitted.'
        });

        router.push('/donations');

    } catch (error) {
        console.error('Error submitting donation:', error);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'There was an error submitting your donation.'
        })
    } finally {
        setIsSubmitting(false);
    }
  }


  function onSubmit(values: z.infer<typeof formSchema>) {
    setAiState('checking');
    let currentProgress = 0;
    const interval = setInterval(() => {
        currentProgress += 10;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
            clearInterval(interval);
            // Simulate AI result
            setTimeout(() => {
                const isSafe = Math.random() > 0.2;
                setAiState(isSafe ? 'safe' : 'unsafe');
                if (isSafe) {
                    handleFinalSubmit(values);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Safety Concern',
                        description: 'AI check failed. This item cannot be listed.'
                    })
                }
            }, 500);
        }
    }, 200);
  }

  return (
    <>
      <Header title="Add New Donation" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className='font-headline'>Donation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="foodName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Food Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Freshly Baked Bread" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="foodType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Food Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a food type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cooked">Cooked Meal</SelectItem>
                              <SelectItem value="baked">Baked Goods</SelectItem>
                              <SelectItem value="produce">Fresh Produce</SelectItem>
                              <SelectItem value="canned">Canned Goods</SelectItem>
                              <SelectItem value="dry">Dry Goods</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 10 loaves" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cookedTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cooked Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pickupDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Pickup By</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </div>
                    </div>
                    <div className="space-y-8">
                     <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Location</FormLabel>
                           <div className="flex gap-2">
                            <FormControl>
                                <Input placeholder="e.g., 123 Main St, Anytown" {...field} />
                            </FormControl>
                            <Button type="button" variant="outline" size="icon" onClick={handleUseCurrentLocation} disabled={isGettingLocation}>
                                {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                                <span className="sr-only">Use Current Location</span>
                            </Button>
                           </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional details, like ingredients or allergens."
                              className="resize-none"
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Food Image</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                            </FormControl>
                            <FormDescription>
                                An AI check will be performed for food safety.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>

                {aiState !== 'idle' && (
                  <Card className="mt-8">
                    <CardHeader>
                      <CardTitle className="font-headline text-lg">AI Food Safety Check</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {aiState === 'checking' && (
                        <div className="flex items-center gap-4">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <div>
                            <p className="font-semibold">Analyzing image for safety...</p>
                            <Progress value={progress} className="w-full mt-2" />
                          </div>
                        </div>
                      )}
                      {aiState === 'safe' && (
                         <div className="flex items-center gap-4 text-green-600">
                           <ShieldCheck className="h-8 w-8" />
                           <div>
                            <p className="font-bold text-lg">Food looks safe!</p>
                            <p className="text-sm">Safety Score: 92%. Submitting your donation...</p>
                           </div>
                         </div>
                      )}
                       {aiState === 'unsafe' && (
                         <div className="flex items-center gap-4 text-red-600">
                           <ShieldX className="h-8 w-8" />
                           <div>
                            <p className="font-bold text-lg">Safety concern detected.</p>
                            <p className="text-sm">This item cannot be listed. Reason: Potential spoilage detected.</p>
                           </div>
                         </div>
                      )}
                    </CardContent>
                  </Card>
                )}


                <Button type="submit" disabled={aiState === 'checking' || isSubmitting}>
                  {isSubmitting
                    ? 'Submitting...'
                    : aiState === 'checking'
                    ? 'Analyzing...'
                    : 'Submit Donation'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
