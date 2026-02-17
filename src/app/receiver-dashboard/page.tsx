
'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { columns } from '@/app/donations/list/columns';
import { DataTable } from '@/app/donations/list/data-table';
import { Donation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
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
import { useAdmin } from '@/hooks/useAdmin';

export default function ReceiverDashboardPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { isAdmin, isAdminLoading } = useAdmin();
  const [donationToRemove, setDonationToRemove] = React.useState<string | null>(
    null
  );

  const availableDonationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'donations'),
      where('status', '==', 'Available')
    );
  }, [firestore, user]);

  const {
    data: donations,
    isLoading: donationsLoading,
    error,
  } = useCollection<Donation>(availableDonationsQuery);

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
      .catch((e) => {
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

  // The hook now handles refreshing, so manual refresh logic is simpler.
  // In a real app you might force a re-fetch, but onSnapshot does this.
  // This button is now mostly for user feedback.
  const handleRefresh = () => {
    toast({
      title: 'Up to date!',
      description: 'The donation list is updated in real-time.',
    });
  };

  const isLoading = isUserLoading || donationsLoading || isAdminLoading;

  return (
    <>
      <Header title="Available Donations" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold font-headline">
            Ready for Pickup
          </h2>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={columns({
              onClaim: handleClaimDonation,
              onRemove: setDonationToRemove,
              currentUser: user,
              isAdmin: isAdmin
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
