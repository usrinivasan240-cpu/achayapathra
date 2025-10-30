'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, ShieldCheck, ShieldX } from 'lucide-react';
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

const formSchema = z.object({
  foodName: z.string().min(2, 'Food name must be at least 2 characters.'),
  foodType: z.string({ required_error: 'Please select a food type.' }),
  quantity: z.string().min(1, 'Quantity is required.'),
  expiryDate: z.date({ required_error: 'Expiry date is required.' }),
  description: z.string().optional(),
  location: z.string().min(2, 'Location is required.'),
  image: z.any().optional(),
});

type AISafetyCheckState = 'idle' | 'checking' | 'safe' | 'unsafe';

export default function NewDonationPage() {
  const [aiState, setAiState] = React.useState<AISafetyCheckState>('idle');
  const [progress, setProgress] = React.useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foodName: '',
      quantity: '',
      location: '',
    },
  });

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
                setAiState(Math.random() > 0.2 ? 'safe' : 'unsafe');
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
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expiration Date</FormLabel>
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
                    <div className="space-y-8">
                     <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 123 Main St, Anytown" {...field} />
                          </FormControl>
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
                                <Input type="file" accept="image/*" {...field} />
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
                            <p className="text-sm">Safety Score: 92%. Your donation is ready to be listed.</p>
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


                <Button type="submit" disabled={aiState === 'checking'}>
                  {aiState === 'checking' ? 'Submitting...' : 'Submit Donation'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
