
'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { columns } from '@/components/donations/columns';
import { DataTable } from '@/components/donations/data-table';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Donation } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DonationsPage() {
  const firestore = useFirestore();

  const donationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'donations'), orderBy('expires', 'desc'));
  }, [firestore]);

  const { data: donationsData, isLoading } = useCollection<Donation>(donationsQuery);
  
  const donations = useMemo(() => {
    return donationsData?.map(d => ({
      ...d,
      // Firestore Timestamps need to be converted to JS Dates for the table and details page
      expires: (d.expires as unknown as Timestamp).toDate(),
    })) || [];
  }, [donationsData]);

  return (
    <>
      <Header title="Donations" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold font-headline">Available Donations</h2>
            <Link href="/donations/new">
                <Button>Add New Donation</Button>
            </Link>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <DataTable columns={columns} data={donations} />
        )}
      </main>
    </>
  );
}
