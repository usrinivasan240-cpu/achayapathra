
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { columns } from './columns';
import { DataTable } from './data-table';
import Link from 'next/link';
import { Donation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';

export default function DonationsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const {
    data: donations,
    isLoading: donationsLoading,
  } = useCollection<Donation>(
    firestore ? collection(firestore, 'donations') : null
  );

  const handleClaimDonation = async (donationId: string) => {
    if (!firestore || !user) return;
    try {
      const donationRef = doc(firestore, 'donations', donationId);
      await updateDoc(donationRef, { status: 'Claimed', claimedBy: user.uid });
      toast({
        title: 'Donation Claimed!',
        description: 'You have successfully claimed the donation.',
      });
    } catch (error) {
      console.error("Error claiming donation:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not claim the donation.'
      })
    }
  };

  const isLoading = isUserLoading || donationsLoading;

  return (
    <>
      <Header title="All Donations" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold font-headline">
            All Community Donations
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
