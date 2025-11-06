
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
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DonationsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [donationToRemove, setDonationToRemove] = React.useState<string | null>(null);

  const donationsQuery = useMemoFirebase(() => {
    // Only create the query if the user is logged in
    if (!firestore || !user) return null;
    return collection(firestore, 'donations');
  }, [firestore, user]);

  const {
    data: donations,
    isLoading: donationsLoading,
  } = useCollection<Donation>(donationsQuery);

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

  const handleMarkAsAvailable = async (donationId: string) => {
    if (!firestore || !user) return;
    try {
      const donationRef = doc(firestore, 'donations', donationId);
      await updateDoc(donationRef, { status: 'Available' });
      toast({
        title: 'Donation Updated!',
        description: 'The donation is now marked as available.',
      });
    } catch (error) {
      console.error("Error updating donation:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the donation status.'
      })
    }
  };

  const handleRemoveDonation = async () => {
    if (!firestore || !donationToRemove) return;
    try {
      await deleteDoc(doc(firestore, 'donations', donationToRemove));
      toast({
        title: 'Donation Removed',
        description: 'The donation has been successfully removed.',
      });
    } catch (error) {
      console.error("Error removing donation:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not remove the donation.'
      });
    } finally {
        setDonationToRemove(null);
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
            columns={columns({ 
                onClaim: handleClaimDonation, 
                onMarkAsAvailable: handleMarkAsAvailable,
                onRemove: setDonationToRemove 
            })}
            data={donations || []}
          />
        )}
      </main>
       <AlertDialog open={!!donationToRemove} onOpenChange={(open) => !open && setDonationToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              donation record from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveDonation}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
