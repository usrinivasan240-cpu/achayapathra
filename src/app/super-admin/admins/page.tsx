'use client';

import * as React from 'react';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAppState } from '@/providers/app-state-provider';
import { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SuperAdminAdminsPage() {
  const { state, addAdminRecord, updateAdminRecord, removeAdminRecord } = useAppState();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading } = useDoc<UserProfile>(userDocRef);

  const [formState, setFormState] = React.useState({
    name: '',
    email: '',
    phone: '',
    canteenId: '',
    counterId: 'all',
  });

  React.useEffect(() => {
    if (!formState.canteenId && state.canteens[0]) {
      setFormState((prev) => ({ ...prev, canteenId: state.canteens[0].id, counterId: 'all' }));
    }
  }, [state.canteens, formState.canteenId]);

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

  const handleSubmit = () => {
    if (!formState.name.trim() || !formState.email.trim() || !formState.canteenId) {
      toast({ title: 'Fill all required fields' });
      return;
    }
    addAdminRecord(
      {
        name: formState.name,
        email: formState.email,
        phone: formState.phone,
        canteenId: formState.canteenId,
        counterId: formState.counterId === 'all' ? null : formState.counterId,
      },
      {
        id: user.uid,
        name: profile.displayName,
        role: 'super-admin',
      }
    );
    toast({ title: `Admin ${formState.name} created.` });
    setFormState({ name: '', email: '', phone: '', canteenId: state.canteens[0]?.id ?? '', counterId: 'all' });
  };

  return (
    <>
      <Header title="Administrators" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Add admin</CardTitle>
            <CardDescription>Assign an administrator to manage a canteen or specific counter.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Name"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Input
              placeholder="Email"
              value={formState.email}
              onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
            />
            <Input
              placeholder="Phone"
              value={formState.phone}
              onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <Select
              value={formState.canteenId}
              onValueChange={(value) => setFormState((prev) => ({ ...prev, canteenId: value, counterId: 'all' }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select canteen" />
              </SelectTrigger>
              <SelectContent>
                {state.canteens.map((canteen) => (
                  <SelectItem key={canteen.id} value={canteen.id}>
                    {canteen.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={formState.counterId}
              onValueChange={(value) => setFormState((prev) => ({ ...prev, counterId: value }))}
              disabled={!formState.canteenId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Counter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All counters</SelectItem>
                {state.canteens
                  .find((canteen) => canteen.id === formState.canteenId)?.counters.map((counter) => (
                    <SelectItem key={counter.id} value={counter.id}>
                      {counter.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="md:col-span-2">
              <Button onClick={handleSubmit}>Create admin</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {state.admins.map((admin) => (
            <Card key={admin.id} className="border-slate-200">
              <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{admin.name}</p>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {state.canteens.find((canteen) => canteen.id === admin.canteenId)?.name ?? 'Unknown canteen'}
                    {admin.counterId && ` • ${admin.counterId.replace(/-/g, ' ')}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Active</span>
                    <Switch
                      checked={admin.isActive}
                      onCheckedChange={(checked) => {
                        updateAdminRecord(
                          admin.id,
                          { isActive: checked },
                          {
                            id: user.uid,
                            name: profile.displayName,
                            role: 'super-admin',
                          }
                        );
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    className="text-rose-600 hover:text-rose-700"
                    onClick={() => {
                      removeAdminRecord(admin.id, {
                        id: user.uid,
                        name: profile.displayName,
                        role: 'super-admin',
                      });
                      toast({ title: `${admin.name} removed.` });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
