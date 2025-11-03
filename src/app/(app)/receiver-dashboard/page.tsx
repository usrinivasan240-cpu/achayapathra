
'use client';

import { useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { columns } from '@/components/donations/columns';
import { DataTable } from '@/components/donations/data-table';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { Donation } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReceiverDashboardPage() {
  const firestore = useFirestore();

  const donationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'donations'), where('status', '==', 'Available'));
  }, [firestore]);

  const { data: donationsData, isLoading } = useCollection<Donation>(donationsQuery);

  const availableDonations = useMemo(() => {
    return donationsData?.map(d => ({
      ...d,
      expires: (d.expires as unknown as Timestamp)?.toDate(),
    })) || [];
  }, [donationsData]);

  return (
    <>
      <Header title="Available Donations" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold font-headline">Ready for Pickup</h2>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <DataTable columns={columns} data={availableDonations} />
        )}
      </main>
    </>
  );
}
