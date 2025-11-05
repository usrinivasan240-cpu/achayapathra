
'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mail, MapPin, Award, History, Loader2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Donation, UserProfile } from '@/lib/types';
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const userDonationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'donations'), where('donorId', '==', user.uid));
  }, [firestore, user]);

  const { data: userDonations, isLoading: areDonationsLoading } = useCollection<Donation>(userDonationsQuery);

  const isLoading = isUserLoading || isProfileLoading || areDonationsLoading;

  const handleProfileUpdate = async (file: File) => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to update your profile.'});
        return;
    }

    const storage = getStorage();
    const storageRef = ref(storage, `profile-pictures/${user.uid}/${file.name}`);

    try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, { photoURL: downloadURL });

        toast({ title: 'Success!', description: 'Your profile picture has been updated.' });

    } catch (error) {
        console.error("Error updating profile picture: ", error);
        toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not update your profile picture.'});
    }
  }


  if (isLoading) {
    return (
      <>
        <Header title="My Profile" />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  if (!user || !userProfile) {
    return (
       <>
        <Header title="My Profile" />
        <div className="flex flex-1 items-center justify-center">
            <p>Could not load user profile.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="My Profile" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="items-center text-center relative">
                 <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit Profile</span>
                </Button>
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={userProfile.photoURL} alt={userProfile.displayName} />
                  <AvatarFallback>
                    {userProfile.displayName.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="font-headline text-3xl">
                  {userProfile.displayName}
                </CardTitle>
                <CardDescription>{userProfile.role}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-muted-foreground">{userProfile.email}</p>
                  </div>
                </div>
                 <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-muted-foreground">{userProfile.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-muted-foreground">{userProfile.address}</p>
                  </div>
                </div>
                 <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Reward Points</p>
                    <p className="font-bold text-lg text-primary">{userProfile.points} pts</p>
                  </div>
                </div>
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
              <CardContent className="space-y-6">
                {userDonations && userDonations.length > 0 ? (
                  userDonations.map((donation, index) => (
                    <div key={donation.id}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                           <p className="font-semibold">{donation.foodName}</p>
                           <p className='text-sm text-muted-foreground'>{donation.location}</p>
                           {donation.pickupBy && (
                            <p className='text-sm text-muted-foreground'>
                                Pickup By: {new Date(donation.pickupBy.seconds * 1000).toLocaleDateString()}
                            </p>
                           )}
                        </div>
                        <div className='text-right'>
                            <Badge>{donation.status}</Badge>
                            <p className='text-sm font-medium mt-2'>{donation.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    You haven&apos;t made any donations yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <EditProfileDialog 
        isOpen={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
}
