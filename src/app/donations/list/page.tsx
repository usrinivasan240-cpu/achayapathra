'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { columns } from './columns';
import { DataTable } from './data-table';
import Link from 'next/link';
import { Donation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';
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
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/language-context';

export default function DonationsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { isAdmin, isAdminLoading } = useAdmin();
  const { t } = useLanguage();
  const [donationToRemove, setDonationToRemove] = React.useState<string | null>(
    null
  );

  const donationsQuery = useMemoFirebase(() => {
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
      .catch((error) => {
        const serializableUpdateData = { status: 'Available', claimedBy: null };
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: donationRef.path,
            operation: 'update',
            requestResourceData: serializableUpdateData,
          })
        );
      });
  };

  const handleRemoveDonation = () => {
    if (!firestore || !donationToRemove) return;
    const donationRef = doc(firestore, 'donations', donationToRemove);
    deleteDoc(donationRef)
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

  const isLoading = isUserLoading || donationsLoading || isAdminLoading;

  return (
    <>
      <Header title={t('donations.allTitle')} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold font-headline">
            {t('donations.communityTitle')}
          </h2>
          <Link href="/donations/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              {t('donations.addNew')}
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="w-full overflow-hidden">
             <DataTable
              columns={columns({
                t,
                onClaim: handleClaimDonation,
                onMarkAsAvailable: handleMarkAsAvailable,
                onRemove: setDonationToRemove,
                currentUser: user,
                isAdmin: isAdmin
              })}
              data={donations || []}
            />
          </div>
        )}
      </main>
      <AlertDialog
        open={!!donationToRemove}
        onOpenChange={(open) => !open && setDonationToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('donations.confirmRemoveTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('donations.confirmRemoveDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('donations.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveDonation}>
              {t('donations.continue')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}