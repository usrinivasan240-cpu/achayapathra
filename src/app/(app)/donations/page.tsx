
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { columns } from '../list/columns';
import { DataTable } from '../list/data-table';
import Link from 'next/link';
import { Donation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { mockDonations } from '@/lib/data';
import { Loader2 } from 'lucide-react';

export default function DonationsPage() {
  const { toast } = useToast();
  const [donations, setDonations] = React.useState<Donation[]>(mockDonations);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setDonations(mockDonations);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleClaimDonation = (donationId: string) => {
    setDonations(prevDonations =>
      prevDonations.map(d =>
        d.id === donationId ? { ...d, status: 'Claimed' } : d
      )
    );
    toast({
      title: 'Donation Claimed!',
      description: 'You have successfully claimed the donation.',
    });
  };

  return (
    <>
      <Header title="Donations" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold font-headline">
            Available Donations
          </h2>
          <Link href="/donations/new">
            <Button>Add New Donation</Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={columns({ onClaim: handleClaimDonation })}
            data={donations || []}
          />
        )}
      </main>
    </>
  );
}
