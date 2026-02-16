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
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  deleteField,
} from 'firebase/firestore';
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
  const [donationToRemove, setDonationToRemove] = React.useState<string | null>(
    null
  );

  const donationsQuery = useMemoFirebase(() => {
    // Only create the query if the user is logged in
    if (!firestore || !user) return null;
    return collection(firestore, 'donations');
  }, [firestore, user]);

  const { data: donations, isLoading: donationsLoading } =
    useCollection<Donation>(donationsQuery);

  const handleClaimDonation = (donationId: string) => {
    if (!firestore || !user) return;
    const donationRef = doc(firestore, 'donations', donationId);
    const updateData = { status: 'Claimed', claimedBy: user.uid };
    updateDoc(donationRef, updateData)
      .then(() => {
        toast({
          title: 'Donation Claimed!',
          description: 'You have successfully claimed the donation.',
        });
      })
      .catch((error) => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: donationRef.path,
            operation: 'update',
            requestResourceData: updateData,
          })
        );
      });
  };

  const handleMarkAsAvailable = (donationId: string) => {
    if (!firestore || !user) return;
    const donationRef = doc(firestore, 'donations', donationId);
    const updateData = { status: 'Available', claimedBy: deleteField() };
    updateDoc(donationRef, updateData)
      .then(() => {
        toast({
          title: 'Donation Updated!',
          description: 'The donation is now marked as available.',
        });
      })
      .catch((error) => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: donationRef.path,
            operation: 'update',
            requestResourceData: updateData,
          })
        );
      });
  };

  const handleRemoveDonation = () => {
    if (!firestore || !donationToRemove) return;
    const donationRef = doc(firestore, 'donations', donationToRemove);
    deleteDoc(donationRef)
      .then(() => {
        toast({
          title: 'Donation Removed',
          description: 'The donation has been successfully removed.',
        });
      })
      .catch((error) => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: donationRef.path,
            operation: 'delete',
          })
        );
      })
      .finally(() => {
        setDonationToRemove(null);
      });
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
              onRemove: setDonationToRemove,
              currentUser: user,
            })}
            data={donations || []}
          />
        )}
      </main>
      <AlertDialog
        open={!!donationToRemove}
        onOpenChange={(open) => !open && setDonationToRemove(null)}
      >
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
