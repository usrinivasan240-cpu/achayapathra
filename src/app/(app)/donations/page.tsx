import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { columns } from './columns';
import { DataTable } from './data-table';
import { mockDonations } from '@/lib/data';
import Link from 'next/link';

export default function DonationsPage() {
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
        <DataTable columns={columns} data={mockDonations} />
      </main>
    </>
  );
}
