
'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Phone,
  Mail,
  MapPin,
  Award,
  History,
  Edit,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { doc, updateDoc, query, collection, where, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Donation, User } from '@/lib/types';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const donationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'donations'), where('donorId', '==', user.uid));
  }, [firestore, user]);

  const { data: donationsData, isLoading: isDonationsLoading } = useCollection<Donation>(donationsQuery);
  
  const userDonations = React.useMemo(() => {
    return donationsData?.map(d => ({
      ...d,
      expires: (d.expires as unknown as Timestamp).toDate(),
    })) || [];
  }, [donationsData]);


  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  
  // These will be populated from Firestore user document
  const [displayName, setDisplayName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [points, setPoints] = React.useState(0);

  React.useEffect(() => {
    if (user) {
        setAvatarUrl(user.photoURL);
        setDisplayName(user.displayName || '');
        // In a real app, phone, address, and points would be fetched
        // from the user's document in Firestore. We'll simulate that
        // when the user document is loaded.
    }
  }, [user]);

  // This is a placeholder for fetching the full user profile from firestore
  // which you would do with `useDoc` on a `/users/{userId}` document.
   React.useEffect(() => {
    if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        const unsub = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data() as User;
                setPhone(data.phone || '');
                setAddress(data.address || '');
                setPoints(data.points || 0);
            }
        });
        return () => unsub();
    }
  }, [user, firestore]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newAvatarDataUrl = reader.result as string;
        setAvatarUrl(newAvatarDataUrl);

        try {
            const storage = getStorage();
            const storageRef = ref(storage, `avatars/${user.uid}`);
            await uploadString(storageRef, newAvatarDataUrl, 'data_url');
            const downloadURL = await getDownloadURL(storageRef);

            // Update Auth and Firestore
            await updateProfile(user, { photoURL: downloadURL });
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, { photoURL: downloadURL });

            setAvatarUrl(downloadURL); // Set the final URL
             toast({
                title: "Avatar Updated!",
                description: "Your new profile picture has been saved.",
            });
        } catch (error) {
             console.error("Error uploading avatar:", error);
            toast({
                variant: 'destructive',
                title: "Upload Failed",
                description: "Could not save your new avatar.",
            });
            // Revert optimistic UI update
            setAvatarUrl(user.photoURL);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to update your profile.',
      });
      return;
    }
    setIsSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: displayName,
        phone: phone,
        address: address,
      });
      if (user.displayName !== displayName) {
          await updateProfile(user, { displayName });
      }

      toast({
        title: 'Profile Updated',
        description: 'Your information has been successfully saved.',
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was a problem saving your changes.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading) {
    return (
      <>
        <Header title="My Profile" />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="items-center text-center">
                  <Skeleton className="mb-4 h-24 w-24 rounded-full" />
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <History className="h-6 w-6" />
                    Donation History
                  </CardTitle>
                  <CardDescription>
                    A record of all your generous contributions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </>
    );
  }

   if (!user) {
    // This should ideally not happen if routes are protected, but it's good practice
    return (
        <>
            <Header title="My Profile" />
            <main className="flex flex-1 items-center justify-center">
                <p>Please log in to view your profile.</p>
            </main>
        </>
    )
   }

  return (
    <>
      <Header title="My Profile" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* User Details Card */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="items-center text-center">
                <div
                  className="group relative cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <Avatar className="mb-4 h-24 w-24">
                    <AvatarImage
                      src={avatarUrl || ''}
                      alt={displayName || 'User'}
                    />
                    <AvatarFallback>
                      {displayName ? displayName.substring(0, 2) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Edit className="h-8 w-8 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <CardTitle className="font-headline text-3xl">
                  {displayName}
                </CardTitle>
                <CardDescription>Donor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-muted-foreground">{phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-muted-foreground">{address || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Reward Points</p>
                    <p className="text-lg font-bold text-primary">
                      {points} pts
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when
                        you&apos;re done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                       <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">
                          Address
                        </Label>
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={handleProfileUpdate}
                        disabled={isSaving}
                      >
                        {isSaving && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>

          {/* Donation History Card */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <History className="h-6 w-6" />
                  Donation History
                </CardTitle>
                <CardDescription>
                  A record of all your generous contributions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isDonationsLoading ? (
                    <div className='space-y-4'>
                        <Skeleton className='h-16 w-full' />
                        <Skeleton className='h-16 w-full' />
                        <Skeleton className='h-16 w-full' />
                    </div>
                ) : userDonations.length > 0 ? (
                  userDonations.map((donation, index) => (
                    <div key={donation.id}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <p className="font-semibold">{donation.foodName}</p>
                          <p className="text-sm text-muted-foreground">
                            {donation.location}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires:{' '}
                            {donation.expires.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge>{donation.status}</Badge>
                          <p className="mt-2 text-sm font-medium">
                            {donation.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-muted-foreground">
                    You haven&apos;t made any donations yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
