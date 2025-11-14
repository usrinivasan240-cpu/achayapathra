'use client';

import * as React from 'react';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/providers/app-state-provider';
import { UserProfile } from '@/lib/types';
import { Loader2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettingsPage() {
  const { state, updateCanteen } = useAppState();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading } = useDoc<UserProfile>(userDocRef);
  const [newCounterName, setNewCounterName] = React.useState('');

  const canteen = React.useMemo(() => state.canteens.find((entry) => entry.id === profile?.canteenId), [state.canteens, profile?.canteenId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Admin access required.
      </div>
    );
  }

  const handleAddCounter = () => {
    if (!canteen || !newCounterName.trim()) {
      toast({ title: 'Give the counter a name' });
      return;
    }
    updateCanteen(
      canteen.id,
      {
        counters: [
          ...canteen.counters,
          {
            id: `counter-${Date.now()}`,
            name: newCounterName,
          },
        ],
      },
      {
        id: user.uid,
        name: profile.displayName,
        role: 'admin',
      }
    );
    toast({ title: `Counter ${newCounterName} added.` });
    setNewCounterName('');
  };

  return (
    <>
      <Header title="Admin settings" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl">Canteen details</CardTitle>
            <CardDescription>Manage counters for {canteen?.name ?? 'assigned canteen'}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-800">Location</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="h-4 w-4" />
                {canteen?.location ?? 'Not set'}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">Counters</p>
              <div className="grid gap-2">
                {canteen?.counters.map((counter) => (
                  <div key={counter.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    {counter.name}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Add new counter"
                  value={newCounterName}
                  onChange={(event) => setNewCounterName(event.target.value)}
                  className="max-w-xs"
                />
                <Button onClick={handleAddCounter}>Add counter</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
