'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimePicker } from '@/components/ui/time-picker';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  foodType: z.string({ required_error: 'Required' }),
  requiredQuantity: z.string().min(1, 'Required'),
  urgency: z.string({ required_error: 'Required' }),
  minShelfLifeHours: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)),
  requiredBefore: z.date({ required_error: 'Required' }),
  location: z.string().min(2, 'Required'),
});

export default function NewDemandPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requiredQuantity: '',
      location: '',
      minShelfLifeHours: 4 as any,
      requiredBefore: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) return;
    setIsSubmitting(true);
    try {
      const demandData = {
        foodType: values.foodType,
        requiredQuantity: values.requiredQuantity,
        urgency: values.urgency,
        minShelfLifeHours: values.minShelfLifeHours,
        requiredBefore: Timestamp.fromDate(values.requiredBefore),
        location: values.location,
        ngoId: user.uid, // Required for security rule validation
        ngoName: user.displayName || 'Unnamed NGO',
        status: 'Active',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(firestore, 'ngo_demands'), demandData);
      router.push('/ngo');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Header title="Pre-Book Requirements" />
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">NGO Demand Registration</CardTitle>
            <CardDescription>Register your surplus food needs for automated AI matching.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="foodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Food Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Cooked Meals">Cooked Meals</SelectItem>
                            <SelectItem value="Dry Ration">Dry Ration</SelectItem>
                            <SelectItem value="Produce">Fresh Produce</SelectItem>
                            <SelectItem value="Bakery">Bakery Items</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requiredQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity Needed</FormLabel>
                        <FormControl><Input placeholder="e.g., 100 Meals" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minShelfLifeHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Shelf Life (Hours)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormDescription>Minimum time before expiry required for pickup.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="requiredBefore"
                    render={({ field }) => (
                      <FormItem className="flex flex-col md:col-span-2">
                        <FormLabel>Required Before (Date & Time)</FormLabel>
                        <div className="flex flex-row items-center gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
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
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Preferred Pickup Location</FormLabel>
                        <FormControl><Input placeholder="Address or Area" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                  Activate Smart Requirement
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}