'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { columns } from '@/app/(app)/donations/columns';
import { DataTable } from '@/app/(app)/donations/data-table';
import { mockDonations as initialDonations } from '@/lib/data';
import { Donation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function ReceiverDashboardPage() {
  const [donations, setDonations] = React.useState<Donation[]>(() =>
    initialDonations.filter((d) => d.status === 'Available')
  );
  const { toast } = useToast();

  // The claim logic is already implemented on the main donations page.
  // This provides a handler to satisfy the columns function signature.
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
      <Header title="Available Donations" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold font-headline">
            Ready for Pickup
          </h2>
        </div>
        <DataTable
          columns={columns({ onClaim: handleClaimDonation })}
          data={donations}
        />
      </main>
    </>
  );
}
