'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { columns } from '@/app/(app)/donations/columns';
import { DataTable } from '@/app/(app)/donations/data-table';
import { Donation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function ReceiverDashboardPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const availableDonationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'donations'), where('status', '==', 'Available'));
  }, [firestore]);

  const { data: donations, isLoading } = useCollection<Donation>(availableDonationsQuery);

  const handleClaimDonation = async (donationId: string) => {
    if (!firestore) return;
    const donationRef = doc(firestore, 'donations', donationId);

    try {
      await updateDoc(donationRef, { status: 'Claimed' });
      toast({
        title: 'Donation Claimed!',
        description: 'You have successfully claimed the donation.',
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not claim the donation. Please try again.',
      });
      console.error('Error claiming donation: ', error);
    }
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
