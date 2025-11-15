'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import apiClient from '@/lib/api-client';
import { AppShell } from '@/components/canteen/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refreshProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    }
  }, [loading, router, user]);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  useEffect(() => {
    if (!user) return;
    form.reset({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || '',
    });
  }, [form, user]);

  const handleSubmit = async (values: ProfileValues) => {
    try {
      await apiClient.put('/users/me', values);
      await refreshProfile();
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error?.response?.data?.message || 'Could not update profile.',
      });
    }
  };

  if (loading || !user) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading profile...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Card className="max-w-2xl border-muted/60">
        <CardHeader>
          <CardTitle className="text-3xl">Your profile</CardTitle>
          <CardDescription>Update your contact details for faster order pickup and notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/avatar.png" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Save changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
