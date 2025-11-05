
'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { columns } from '@/app/(app)/donations/list/columns';
import { DataTable } from '@/app/(app)/donations/list/data-table';
import { Donation } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { mockDonations } from '@/lib/data';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReceiverDashboardPage() {
  const { toast } = useToast();
  const [donations, setDonations] = React.useState<Donation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchDonations = React.useCallback(() => {
    setIsLoading(true);
    // Simulate fetching available donations
    setTimeout(() => {
      const available = mockDonations.filter(d => d.status === 'Available');
      setDonations(available);
      setIsLoading(false);
    }, 500);
  }, []);

  React.useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);
  
  const handleClaimDonation = (donationId: string) => {
    // This is a mock implementation. In a real app, you'd update a shared state.
    // For now, it just removes it from this local view.
    setDonations(prevDonations => prevDonations.filter(d => d.id !== donationId));
    toast({
      title: 'Donation Claimed!',
      description: 'You have successfully claimed the donation.',
    });
  };

  return (
    <>
      <Header title="Available Donations" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold font-headline">
            Ready for Pickup
          </h2>
          <Button variant="outline" onClick={fetchDonations} disabled={isLoading}>
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
