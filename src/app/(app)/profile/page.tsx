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
import { Phone, Mail, MapPin, Award, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  // We'll use the first mock user as the logged-in user
  const user = mockUsers[0];
  const userDonations = mockDonations.filter((d) => d.donor.id === user.id);

  return (
    <>
      <Header title="My Profile" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* User Details Card */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>
                    {user.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="font-headline text-3xl">
                  {user.name}
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
                    <p className="text-muted-foreground">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-muted-foreground">{user.address}</p>
                  </div>
                </div>
                 <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Reward Points</p>
                    <p className="font-bold text-lg text-primary">{user.points} pts</p>
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
