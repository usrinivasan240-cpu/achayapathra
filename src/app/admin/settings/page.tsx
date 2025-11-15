'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ShieldCheck, UserPlus } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { AppShell } from '@/components/canteen/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const canteenSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  location: z.string().optional(),
  description: z.string().optional(),
});

const adminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  canteens: z.string().optional(),
});

type CanteenFormValues = z.infer<typeof canteenSchema>;
type AdminFormValues = z.infer<typeof adminSchema>;

interface CanteenLite {
  _id: string;
  name: string;
  code: string;
  location?: string;
}

interface AdminLite {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  canteens?: Array<{ name: string; code: string }>;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/admin/login');
    } else if (!isAdmin) {
      router.replace('/home');
    }
  }, [isAdmin, loading, router, user]);

  const [canteens, setCanteens] = useState<CanteenLite[]>([]);
  const [admins, setAdmins] = useState<AdminLite[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const canteenForm = useForm<CanteenFormValues>({
    resolver: zodResolver(canteenSchema),
    defaultValues: { name: '', code: '', location: '', description: '' },
  });
  const adminForm = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: { name: '', email: '', password: '', canteens: '' },
  });

  const loadData = async () => {
    if (!isAdmin) return;
    try {
      setLoadingData(true);
      const requests = [apiClient.get('/admin/canteens')];
      if (user?.role === 'super-admin') {
        requests.push(apiClient.get('/admin/admins'));
      }
      const [canteenRes, adminsRes] = await Promise.all(requests);
      setCanteens(canteenRes.data.canteens || []);
      if (adminsRes) {
        setAdmins(adminsRes.data.admins || []);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Unable to load settings', description: error.message });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  const createCanteen = async (values: CanteenFormValues) => {
    if (user?.role !== 'super-admin') return;
    try {
      const response = await apiClient.post('/admin/canteens', values);
      setCanteens((prev) => [response.data.canteen, ...prev]);
      toast({ title: 'Canteen added', description: `${values.name} is now onboarded.` });
      canteenForm.reset();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Unable to add canteen', description: error?.response?.data?.message || error.message });
    }
  };

  const createAdmin = async (values: AdminFormValues) => {
    if (user?.role !== 'super-admin') return;
    try {
      const payload = {
        ...values,
        canteens: values.canteens
          ? values.canteens.split(',').map((code) => code.trim()).filter(Boolean)
          : undefined,
      };
      const response = await apiClient.post('/admin/admins', payload);
      setAdmins((prev) => [response.data.admin, ...prev]);
      toast({ title: 'Admin created', description: `${values.email} now has access.` });
      adminForm.reset();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Unable to create admin', description: error?.response?.data?.message || error.message });
    }
  };

  if (loading || !user) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading settings...</div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          You do not have permission to access settings.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-headline text-3xl">Admin & canteen settings</h1>
        <p className="text-muted-foreground">Govern the platform, counters and access roles from a single panel.</p>
      </div>

      {loadingData && (
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading data...
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {user?.role === 'super-admin' && (
          <Card className="border-primary/40 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ShieldCheck className="h-5 w-5 text-primary" /> Add canteen
              </CardTitle>
              <CardDescription>Register a new counter/location for ordering.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={canteenForm.handleSubmit(createCanteen)}>
                <Input placeholder="Canteen name" {...canteenForm.register('name')} />
                <Input placeholder="Unique code (e.g., central)" {...canteenForm.register('code')} />
                <Input placeholder="Location" {...canteenForm.register('location')} />
                <Input placeholder="Description" {...canteenForm.register('description')} />
                <Button type="submit" className="w-full">
                  Add canteen
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {user?.role === 'super-admin' && (
          <Card className="border-muted/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" /> Invite admin
              </CardTitle>
              <CardDescription>Create canteen administrators with secure login.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={adminForm.handleSubmit(createAdmin)}>
                <Input placeholder="Full name" {...adminForm.register('name')} />
                <Input placeholder="Email" type="email" {...adminForm.register('email')} />
                <Input placeholder="Temporary password" type="password" {...adminForm.register('password')} />
                <Input
                  placeholder="Canteen codes (comma separated)"
                  {...adminForm.register('canteens')}
                />
                <Button type="submit" className="w-full">
                  Invite admin
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active canteens</CardTitle>
            <CardDescription>Manage counters connected to the ordering platform.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {canteens.length === 0 ? (
              <p className="text-muted-foreground">No canteens registered yet.</p>
            ) : (
              canteens.map((canteen) => (
                <div key={canteen._id} className="rounded-lg border border-border/60 bg-card/60 p-4">
                  <p className="font-semibold">{canteen.name}</p>
                  <p className="text-xs uppercase text-muted-foreground">Code: {canteen.code}</p>
                  {canteen.location && <p className="text-sm text-muted-foreground">{canteen.location}</p>}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {user?.role === 'super-admin' && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>Review who has access across canteens.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {admins.length === 0 ? (
                <p className="text-muted-foreground">No admin users yet.</p>
              ) : (
                admins.map((admin) => (
                  <div key={admin._id} className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/60 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{admin.name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{admin.role}</Badge>
                      {admin.canteens?.map((c) => (
                        <Badge key={`${admin._id}-${c.code}`} variant="secondary">
                          {c.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
