'use client';

import * as React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { Loader2, MapPin, Phone, Save, UserCog } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { useAppState } from '@/providers/app-state-provider';
import { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { state, toggleFavorite } = useAppState();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading } = useDoc<UserProfile>(userDocRef);
  const [displayName, setDisplayName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [pushReady, setPushReady] = React.useState(true);
  const [emailUpdates, setEmailUpdates] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setPhone(profile.phone);
    setAddress(profile.address);
    setPushReady(profile.notificationPreferences?.pushReady ?? true);
    setEmailUpdates(profile.notificationPreferences?.emailUpdates ?? true);
  }, [profile]);

  const favoriteIds = React.useMemo(() => {
    if (!user) return [] as string[];
    return state.favoriteMap[user.uid] ?? [];
  }, [state.favoriteMap, user]);

  const favoriteItems = React.useMemo(
    () => state.menuItems.filter((item) => favoriteIds.includes(item.id)),
    [state.menuItems, favoriteIds]
  );

  const handleSave = async () => {
    if (!userDocRef) return;
    setIsSaving(true);
    try {
      await updateDoc(userDocRef, {
        displayName,
        phone,
        address,
        notificationPreferences: {
          pushReady,
          emailUpdates,
        },
      });
      toast({ title: 'Profile updated' });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Unable to update profile',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header title="Profile" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile.photoURL} alt={profile.displayName} />
                  <AvatarFallback>{profile.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{profile.displayName}</CardTitle>
                  <CardDescription className="capitalize">{profile.role}</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="px-3 py-1 text-sm">
                Loyalty points: {profile.loyaltyPoints}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Full name
                  </label>
                  <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Textarea
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      className="min-h-[80px] pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">Notification preferences</p>
                <div className="mt-3 flex flex-col gap-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Ready for pickup alerts</p>
                      <p className="text-xs text-slate-500">
                        Receive real-time notifications when the counter marks an order ready.
                      </p>
                    </div>
                    <Switch checked={pushReady} onCheckedChange={setPushReady} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email summaries</p>
                      <p className="text-xs text-slate-500">
                        Weekly digest of order history and upcoming offers.
                      </p>
                    </div>
                    <Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} />
                  </div>
                </div>
              </div>

              <Button className="w-full md:w-auto" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" /> Save changes
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCog className="h-4 w-4 text-primary" /> Favourite dishes
              </CardTitle>
              <CardDescription>
                Quickly reorder dishes you love. Tap to remove from favourites.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {favoriteItems.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-100 py-6 text-center text-sm text-slate-500">
                  Mark dishes on the home screen to see them here.
                </p>
              ) : (
                favoriteItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        ₹{item.price} • {item.category}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => user && toggleFavorite({ userId: user.uid, menuItemId: item.id })}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
