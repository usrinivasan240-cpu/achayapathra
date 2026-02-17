'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { type User } from 'firebase/auth';

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
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const statusVariantMap: { [key in Donation['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Available: 'default',
    Claimed: 'secondary',
    Delivered: 'outline',
    Pending: 'destructive'
};


export const columns = (options: { 
    onClaim?: (id: string) => void, 
    onMarkAsAvailable?: (id: string) => void,
    onRemove?: (id: string) => void,
    currentUser?: User | null,
    isAdmin?: boolean
} = {}): ColumnDef<Donation>[] => [
  {
    accessorKey: 'foodName',
    header: 'Food Item',
    cell: ({ row }) => {
        const donation = row.original;
        return (
            <div className="flex items-center gap-3">
                 <Avatar className="h-12 w-12 rounded-md">
                    {donation.imageURL ? (
                        <AvatarImage src={donation.imageURL} alt={donation.foodName} className="object-cover" />
                    ) : (
                        <AvatarFallback className="rounded-md">
                            {donation.foodName.substring(0, 2)}
                        </AvatarFallback>
                    )}
                </Avatar>
                <div className="font-medium">{donation.foodName}</div>
            </div>
        )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Donation['status'];
      return <Badge variant={statusVariantMap[status] || 'secondary'}>{status}</Badge>;
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
    accessorKey: 'expiryTime',
    header: 'Expires On',
    cell: ({ row }) => {
      const expiryTime = row.getValue('expiryTime') as Timestamp | undefined;
      if (!expiryTime) return <span>N/A</span>;
      // Firestore Timestamps are automatically converted to Date objects
      // when they are used in a client component with the hooks.
      // However, to be safe, we can handle both cases.
      const date = expiryTime instanceof Timestamp ? expiryTime.toDate() : expiryTime;
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const donation = row.original;
      const isOwner = options.currentUser?.uid === donation.donorId;
      const canRemove = isOwner || options.isAdmin;

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
            {options.onRemove && canRemove && (
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
