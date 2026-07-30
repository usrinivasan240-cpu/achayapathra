'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2, MapPin, Calendar as CalendarIcon, ShieldCheck, PackagePlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ui/image-upload';
import { TimePicker } from '@/components/ui/time-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const FOOD_TAGS = [
  { id: 'High Protein', label: 'High Protein' },
  { id: 'Child Friendly', label: 'Child Friendly' },
  { id: 'Elderly Suitable', label: 'Elderly Suitable' },
  { id: 'Emergency Meal', label: 'Emergency Meal' },
];

const formSchema = z.object({
  foodName: z.string().min(2, 'Food name must be at least 2 characters.'),
  foodType: z.string({ required_error: 'Please select a food type.' }),
  quantity: z.string().min(1, 'Quantity is required.'),
  cookedTime: z.date({ required_error: 'Cooked date and time is required.' }),
  expiryTime: z.date({ required_error: 'Expiry date and time is required.' }),
  description: z.string().optional(),
  location: z.string().min(2, 'Location is required.'),
  tags: z.array(z.string()).default([]),
  image: z.any()
    .refine((file): file is File => file instanceof File, 'Image is required.')
    .refine((file) => !(file instanceof File) || file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine((file) => !(file instanceof File) || ACCEPTED_IMAGE_TYPES.includes(file.type), 'Formats: JPG, PNG, WEBP.'),
}).refine(data => data.expiryTime > data.cookedTime, {
  message: 'Expiry must be after cooked time.',
  path: ['expiryTime'],
});

const resizeImage = (file: File, maxSize: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) { if (width > maxSize) { height = Math.round(height * (maxSize / width)); width = maxSize; } }
        else { if (height > maxSize) { width = Math.round(width * (maxSize / height)); height = maxSize; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas error'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export default function NewDonationPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);
  const [coords, setCoords] = React.useState<{latitude: number, longitude: number} | null>(null);
  
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
      cookedTime: new Date(),
      expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 4),
      tags: [],
    },
  });

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      form.setValue('location', `Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)}`);
      setIsGettingLocation(false);
    }, () => setIsGettingLocation(false));
  };

  const toggleTag = (tagId: string) => {
    const currentTags = form.getValues('tags');
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(t => t !== tagId)
      : [...currentTags, tagId];
    form.setValue('tags', newTags, { shouldValidate: true });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) return;
    setIsSubmitting(true);
    try {
      const resized = await resizeImage(values.image as File, 800);
      const trackingId = `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      await addDoc(collection(firestore, 'donations'), {
        donorId: user.uid,
        foodName: values.foodName,
        foodType: values.foodType,
        quantity: values.quantity,
        cookedTime: Timestamp.fromDate(values.cookedTime),
        expiryTime: Timestamp.fromDate(values.expiryTime),
        description: values.description || '',
        location: values.location,
        lat: coords?.latitude || 0,
        lng: coords?.longitude || 0,
        status: 'Available',
        createdAt: serverTimestamp(),
        imageURL: resized,
        trackingId: trackingId,
        tags: values.tags,
        ai_matches: [],
        matching_metadata: {
          matched_demands: [],
          expansion_level: 0
        },
        donor: {
          id: user.uid,
          name: user.displayName || 'Anonymous',
          email: user.email || '',
          photoURL: user.photoURL || '',
        },
      });

      router.push('/donations/list');
    } catch (e: any) {
      toast({ 
        variant: 'destructive', 
        title: 'Listing Failed', 
        description: e.message || 'Could not list your donation. Please try again.' 
      });
    } finally { 
      setIsSubmitting(false); 
    }
  }

  return (
    <>
      <Header title="New Donation" />
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <Card className="max-w-4xl mx-auto w-full">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <PackagePlus className="h-6 w-6 text-primary" />
              List Surplus Food
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <FormField control={form.control} name="foodName" render={({ field }) => (
                      <FormItem><FormLabel>Food Name</FormLabel><FormControl><Input placeholder="e.g. Vegetable Biryani" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="foodType" render={({ field }) => (
                      <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Cooked Meals">Cooked Meals</SelectItem><SelectItem value="Produce">Produce</SelectItem><SelectItem value="Bakery">Bakery</SelectItem><SelectItem value="Dry Ration">Dry Ration</SelectItem></SelectContent></Select></FormItem>
                    )} />
                    <FormField control={form.control} name="quantity" render={({ field }) => (
                      <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input placeholder="e.g. 50 Meals" {...field} /></FormControl></FormItem>
                    )} />
                    
                    <div className="grid grid-cols-1 gap-6">
                      <FormField control={form.control} name="cookedTime" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Cooked At</FormLabel>
                          <div className="flex flex-row items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal h-10",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <div className="w-[140px] shrink-0">
                                <TimePicker date={field.value} setDate={field.onChange} />
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="expiryTime" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expires At</FormLabel>
                          <div className="flex flex-row items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal h-10",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                            <div className="w-[140px] shrink-0">
                                <TimePicker date={field.value} setDate={field.onChange} />
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem><FormLabel>Location</FormLabel><div className="flex gap-2"><FormControl><Input placeholder="Pickup Address" {...field} /></FormControl><Button type="button" variant="outline" size="icon" onClick={handleUseCurrentLocation} disabled={isGettingLocation}><MapPin className="h-4 w-4" /></Button></div></FormItem>
                    )} />
                    
                    <div className="space-y-2">
                      <FormLabel>Add food tags</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {FOOD_TAGS.map((tag) => {
                          const isSelected = form.watch('tags').includes(tag.id);
                          return (
                            <Badge
                              key={tag.id}
                              variant={isSelected ? 'default' : 'outline'}
                              className={cn(
                                "cursor-pointer py-1.5 px-3 transition-all",
                                !isSelected && "hover:bg-primary/10"
                              )}
                              onClick={() => toggleTag(tag.id)}
                            >
                              {isSelected && <Check className="mr-1 h-3 w-3" />}
                              {tag.label}
                            </Badge>
                          );
                        })}
                      </div>
                      <FormDescription className="text-[10px]">
                        Select tags to help receivers identify the suitability of this food.
                      </FormDescription>
                    </div>

                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem><FormLabel>Details</FormLabel><FormControl><Textarea rows={4} placeholder="Any specific instructions..." {...field} /></FormControl></FormItem>
                    )} />
                    <ImageUpload name="image" label="Food Photo" accept={{ 'image/*': ['.jpg', '.png'] }} maxSize={5242880} />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (
                    <>
                      <ShieldCheck className="mr-2 h-5 w-5" />
                      List Donation
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
