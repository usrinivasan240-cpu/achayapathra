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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const statusVariantMap: { [key in Donation['status']]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    Available: 'default',
    Claimed: 'secondary',
    Delivered: 'outline',
    'Picked Up': 'outline',
    Pending: 'destructive',
    Expired: 'destructive',
    Redirected: 'secondary',
    Biogas: 'secondary',
    Fertilizer: 'secondary'
};


export const columns = (options: { 
    t: (key: string) => string,
    onClaim?: (id: string) => void, 
    onMarkAsAvailable?: (id: string) => void,
    onRemove?: (id: string) => void,
    currentUser?: User | null,
    isAdmin?: boolean
}): ColumnDef<Donation>[] => [
  {
    accessorKey: 'foodName',
    header: options.t('donations.foodItem'),
    cell: ({ row }) => {
        const donation = row.original;
        return (
            <div className="flex items-center gap-2 sm:gap-3">
                 <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-md">
                    {donation.imageURL ? (
                        <AvatarImage src={donation.imageURL} alt={donation.foodName} className="object-cover" />
                    ) : (
                        <AvatarFallback className="rounded-md">
                            {donation.foodName.substring(0, 2)}
                        </AvatarFallback>
                    )}
                </Avatar>
                <div className="font-bold text-sm sm:text-base line-clamp-1 max-w-[120px] sm:max-w-none">
                  {donation.foodName}
                </div>
            </div>
        )
    },
  },
  {
    accessorKey: 'status',
    header: options.t('donations.status'),
    cell: ({ row }) => {
      const status = row.getValue('status') as Donation['status'];
      return <Badge variant={statusVariantMap[status] || 'secondary'} className="text-[10px] sm:text-xs">{status}</Badge>;
    },
  },
  {
    accessorKey: 'quantity',
    header: options.t('donations.quantity'),
    cell: ({ row }) => <span className="text-xs sm:text-sm font-medium">{row.getValue('quantity')}</span>
  },
  {
    id: 'actions',
    header: options.t('donations.actions'),
    cell: ({ row }) => {
      const donation = row.original;
      const canRemove = options.isAdmin || (options.currentUser && options.currentUser.uid === donation.donorId);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{options.t('donations.actions')}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(donation.id)}
            >
              {options.t('donations.copyId')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/donations/${donation.id}`}>{options.t('donations.viewDetails')}</Link>
            </DropdownMenuItem>
            {options.onClaim && (
                <DropdownMenuItem
                    onClick={() => options.onClaim?.(donation.id)}
                    disabled={donation.status !== 'Available'}
                >
                {options.t('donations.claim')}
                </DropdownMenuItem>
            )}
            {options.onMarkAsAvailable && (
                <DropdownMenuItem
                    onClick={() => options.onMarkAsAvailable?.(donation.id)}
                    disabled={donation.status === 'Available'}
                >
                {options.t('donations.markAvailable')}
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
                    {options.t('donations.remove')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
