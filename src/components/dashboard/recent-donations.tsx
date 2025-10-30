import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from '@/components/ui/avatar';
  import { mockDonations } from '@/lib/data';
  
  export function RecentDonations() {
    return (
      <div className="space-y-8">
        {mockDonations.slice(0, 5).map((donation) => (
          <div className="flex items-center" key={donation.id}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={donation.donor.avatarUrl} alt="Avatar" />
              <AvatarFallback>{donation.donor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{donation.donor.name}</p>
              <p className="text-sm text-muted-foreground">
                Donated {donation.foodName}
              </p>
            </div>
            <div className="ml-auto font-medium">{donation.quantity}</div>
          </div>
        ))}
      </div>
    );
  }
  