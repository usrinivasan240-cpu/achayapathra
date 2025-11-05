
'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { columns } from '@/app/donations/list/columns';
import { DataTable } from '@/app/donations/list/data-table';
import { Donation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';

export default function ReceiverDashboardPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const availableDonationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'donations'), where('status', '==', 'Available'));
  }, [firestore, user]);

  const { data: donations, isLoading: donationsLoading, error } = useCollection<Donation>(availableDonationsQuery);
  
  const handleClaimDonation = async (donationId: string) => {
    if (!firestore || !user) return;
    try {
      const donationRef = doc(firestore, 'donations', donationId);
      await updateDoc(donationRef, { status: 'Claimed', claimedBy: user.uid });
      toast({
        title: 'Donation Claimed!',
        description: 'You have successfully claimed the donation.',
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not claim the donation.'
      });
    }
  };

  // The hook now handles refreshing, so manual refresh logic is simpler.
  // In a real app you might force a re-fetch, but onSnapshot does this.
  // This button is now mostly for user feedback.
  const handleRefresh = () => {
    toast({
      title: 'Up to date!',
      description: 'The donation list is updated in real-time.',
    });
  };
  
  const isLoading = isUserLoading || donationsLoading;

  return (
    <>
      <Header title="Available Donations" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold font-headline">
            Ready for Pickup
          </h2>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
