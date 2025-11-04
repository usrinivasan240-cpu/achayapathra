'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { columns } from './columns';
import { DataTable } from './data-table';
import { mockDonations as initialDonations } from '@/lib/data';
import Link from 'next/link';
import { Donation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function DonationsPage() {
  const [donations, setDonations] = React.useState<Donation[]>(initialDonations);
  const { toast } = useToast();

  const handleClaimDonation = (donationId: string) => {
    setDonations((prevDonations) =>
      prevDonations.map((donation) => {
        if (donation.id === donationId && donation.status === 'Available') {
          toast({
            title: 'Donation Claimed!',
            description: `You have successfully claimed "${donation.foodName}".`,
          });
          return { ...donation, status: 'Claimed' };
        }
        return donation;
      })
    );
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
        <DataTable
          columns={columns({ onClaim: handleClaimDonation })}
          data={donations}
        />
      </main>
    </>
  );
}
