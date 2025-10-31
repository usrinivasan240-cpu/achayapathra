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
import { mockUsers, mockDonations } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mail, MapPin, Award, History, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  // We'll use the first mock user as the logged-in user
  const { user, isUserLoading } = useUser();
  const userDonations = mockDonations.filter((d) => user && d.donor.id === user.id);

  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user?.photoURL) {
      setAvatarUrl(user.photoURL);
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatarUrl = reader.result as string;
        setAvatarUrl(newAvatarUrl);
        // In a real app, you would upload the file to Firebase Storage
        // and then update the user's photoURL in Firestore and Firebase Auth.
        // For example:
        // 1. Upload `file` to Firebase Storage.
        // 2. Get the download URL.
        // 3. updateProfile(auth.currentUser, { photoURL: downloadURL });
        // 4. updateDoc(doc(firestore, 'users', user.uid), { photoURL: downloadURL });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isUserLoading || !user) {
    return (
        <>
            <Header title="My Profile" />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader className="items-center text-center">
                                <Skeleton className="h-24 w-24 rounded-full mb-4" />
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
                <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={avatarUrl || ''} alt={user.displayName || 'User'} />
                        <AvatarFallback>
                            {user.displayName ? user.displayName.substring(0, 2) : 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
                  {user.displayName}
                </CardTitle>
                <CardDescription>Donor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                 <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-muted-foreground">{mockUsers[0].phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-muted-foreground">{mockUsers[0].address}</p>
                  </div>
                </div>
                 <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Reward Points</p>
                    <p className="font-bold text-lg text-primary">{mockUsers[0].points} pts</p>
                  </div>
                </div>
              </CardContent>
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
                {userDonations.length > 0 ? (
                  userDonations.map((donation, index) => (
                    <div key={donation.id}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                           <p className="font-semibold">{donation.foodName}</p>
                           <p className='text-sm text-muted-foreground'>{donation.location}</p>
                           <p className='text-sm text-muted-foreground'>Expires: {donation.expires.toLocaleDateString()}</p>
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
    </>
  );
}
