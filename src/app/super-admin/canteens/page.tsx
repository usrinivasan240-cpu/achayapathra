'use client';

import * as React from 'react';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppState } from '@/providers/app-state-provider';
import { UserProfile } from '@/lib/types';
import { Loader2, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminCanteensPage() {
  const { state, addCanteen, removeCanteen } = useAppState();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading } = useDoc<UserProfile>(userDocRef);

  const [name, setName] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [counterName, setCounterName] = React.useState('Main Counter');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || profile.role !== 'super-admin') {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Super admin access required.
      </div>
    );
  }

  const handleCreate = () => {
    if (!name.trim() || !location.trim()) {
      toast({ title: 'Provide canteen name and location' });
      return;
    }
    addCanteen(
      {
        name,
        location,
        description,
        counters: [{ name: counterName }],
      },
      {
        id: user.uid,
        name: profile.displayName,
        role: 'super-admin',
      }
    );
    toast({ title: `${name} added to the platform.` });
    setName('');
    setLocation('');
    setDescription('');
    setCounterName('Main Counter');
  };

  return (
    <>
      <Header title="Manage canteens" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Add new canteen</CardTitle>
            <CardDescription>Provision a canteen and assign counters instantly.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Canteen name
              </label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location
              </label>
              <Input value={location} onChange={(event) => setLocation(event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Description
              </label>
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Default counter
              </label>
              <Input value={counterName} onChange={(event) => setCounterName(event.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleCreate}>Create canteen</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {state.canteens.map((canteen) => (
            <Card key={canteen.id} className="border-slate-200">
              <CardHeader className="flex items-start justify-between">
                <div>
                  <CardTitle>{canteen.name}</CardTitle>
                  <CardDescription>{canteen.location}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  className="text-rose-600 hover:text-rose-700"
                  onClick={() => {
                    removeCanteen(canteen.id, {
                      id: user.uid,
                      name: profile.displayName,
                      role: 'super-admin',
                    });
                    toast({ title: `${canteen.name} removed.` });
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  {canteen.counters.map((counter) => (
                    <Badge key={counter.id} variant="secondary">
                      {counter.name}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Total orders tracked: {canteen.totalOrders} · Revenue recorded: ₹{canteen.totalRevenue.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
