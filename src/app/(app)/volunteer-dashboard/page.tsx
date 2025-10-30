
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { DataTable } from '@/app/(app)/donations/data-table';
import { columns } from '@/app/(app)/donations/columns';
import { mockDonations, mockUsers } from '@/lib/data';
import { MapPin } from 'lucide-react';

export default function VolunteerDashboardPage() {
  const availableDonations = mockDonations.filter(d => d.status === 'Available' || d.status === 'Claimed');
  const volunteer = mockUsers.find(u => u.id === '2'); // Example volunteer

  return (
    <>
      <Header title="Volunteer Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline">Donation Board</CardTitle>
              <CardDescription>
                Available and claimed donations ready for pickup and delivery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={availableDonations} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Your Location</CardTitle>
               <CardDescription>
                Your current assigned area for deliveries.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold text-lg">Coimbatore</p>
                <p className="text-muted-foreground">Tamil Nadu</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
