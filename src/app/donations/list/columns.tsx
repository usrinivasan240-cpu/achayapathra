
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Donation } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

const statusVariantMap: { [key in Donation['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Available: 'default',
    Claimed: 'secondary',
    Delivered: 'outline',
    Pending: 'destructive'
};


export const columns = (options: { 
    onClaim?: (id: string) => void, 
    onMarkAsAvailable?: (id: string) => void,
    onRemove?: (id: string) => void 
} = {}): ColumnDef<Donation>[] => [
  {
    accessorKey: 'foodName',
    header: 'Food Item',
    cell: ({ row }) => (
        <div className="font-medium">{row.getValue('foodName')}</div>
      ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Donation['status'];
      return <Badge variant={statusVariantMap[status]}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
  },
  {
    accessorKey: 'location',
    header: 'Location',
  },
  {
    accessorKey: 'pickupBy',
    header: 'Pickup By',
    cell: ({ row }) => {
      const pickupBy = row.getValue('pickupBy') as Timestamp | undefined;
      if (!pickupBy) return <span>N/A</span>;
      // Firestore Timestamps are automatically converted to Date objects
      // when they are used in a client component with the hooks.
      // However, to be safe, we can handle both cases.
      const date = pickupBy instanceof Timestamp ? pickupBy.toDate() : pickupBy;
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const donation = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(donation.id)}
            >
              Copy donation ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/donations/${donation.id}`}>View details</Link>
            </DropdownMenuItem>
            {options.onClaim && (
                <DropdownMenuItem
                    onClick={() => options.onClaim?.(donation.id)}
                    disabled={donation.status !== 'Available'}
                >
                Claim donation
                </DropdownMenuItem>
            )}
            {options.onMarkAsAvailable && (
                <DropdownMenuItem
                    onClick={() => options.onMarkAsAvailable?.(donation.id)}
                    disabled={donation.status === 'Available'}
                >
                Mark as Available
                </DropdownMenuItem>
            )}
            {options.onRemove && (
              <>
                <DropdownMenuSeparator />
                 <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={() => options.onRemove?.(donation.id)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove donation
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
