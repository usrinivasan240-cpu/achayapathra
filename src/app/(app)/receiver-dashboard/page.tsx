
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { columns } from '@/app/(app)/donations/columns';
import { DataTable } from '@/app/(app)/donations/data-table';
import { mockDonations } from '@/lib/data';
import Link from 'next/link';

export default function ReceiverDashboardPage() {
  const availableDonations = mockDonations.filter(d => d.status === 'Available');

  return (
    <>
      <Header title="Available Donations" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold font-headline">Ready for Pickup</h2>
        </div>
        <DataTable columns={columns} data={availableDonations} />
      </main>
    </>
  );
}

