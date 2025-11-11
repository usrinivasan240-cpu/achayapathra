
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
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useFirebaseApp } from '@/firebase';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui/image-upload';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const formSchema = z.object({
  foodName: z.string().min(2, 'Food name must be at least 2 characters.'),
  foodType: z.string({ required_error: 'Please select a food type.' }),
  quantity: z.string().min(1, 'Quantity is required.'),
  cookedTime: z.string().min(1, 'Cooked time is required.'),
  pickupDate: z.date({ required_error: 'Pickup date is required.' }),
  description: z.string().optional(),
  location: z.string().min(2, 'Location is required.'),
  image: z
    .any()
    .refine((files) => files?.length === 1, 'Image is required.')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 2MB.`
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
});


type LocationCoords = {
    latitude: number;
    longitude: number;
} | null;

export default function NewDonationPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);
  const [coords, setCoords] = React.useState<LocationCoords>(null);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const firebaseApp = useFirebaseApp();


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
        const { latitude, longitude } = position.coords;
        setCoords({latitude, longitude});
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

  const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user || !firebaseApp) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not connect to the database. Please try again.'
        });
        return;
    }
    
    setIsSubmitting(true);
    const imageFile = values.image[0] as File;
    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `donations-images/${user.uid}/${Date.now()}-${imageFile.name}`);

    try {
        const [hours, minutes] = values.cookedTime.split(':').map(Number);
        const cookedDateTime = new Date(values.pickupDate);
        cookedDateTime.setHours(hours, minutes, 0, 0);

        // Perform AI check and upload in parallel
        const uploadResult = await uploadBytes(storageRef, imageFile);

        const imageUrl = await getDownloadURL(uploadResult.ref);

        // If everything is successful, add the document to Firestore
        await addDoc(collection(firestore, 'donations'), {
            donorId: user.uid,
            foodName: values.foodName,
            foodType: values.foodType,
            quantity: values.quantity,
            cookedTime: Timestamp.fromDate(cookedDateTime),
            pickupBy: Timestamp.fromDate(values.pickupDate),
            description: values.description || '',
            location: values.location,
            ...(coords && { lat: coords.latitude, lng: coords.longitude }),
            status: 'Available', // Set status directly to Available
            createdAt: serverTimestamp(),
            imageURL: imageUrl,
            aiImageAnalysis: 'Verified as food.',
            donor: {
                id: user.uid,
                name: user.displayName || 'Anonymous',
                email: user.email,
                photoURL: user.photoURL || '',
            }
        });

        toast({
            title: 'Donation Submitted!',
            description: 'Your donation has been successfully listed.'
        });
        router.push('/donations/list');

    } catch (error: any) {
        console.error('Donation submission error:', error);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: error.message || 'There was an error submitting your donation.'
        });
        // Clean up uploaded image if submission fails
        try {
            await deleteObject(storageRef);
        } catch (deleteError) {
            console.error('Failed to clean up image after submission error:', deleteError);
        }

    } finally {
        setIsSubmitting(false);
    }
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
                          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setIsCalendarOpen(false);
                                }}
                                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
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
                              rows={3}
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
                                    <ImageUpload
                                        onChange={(files) => field.onChange(files)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    </div>
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Submitting...' : 'Submit Donation'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
