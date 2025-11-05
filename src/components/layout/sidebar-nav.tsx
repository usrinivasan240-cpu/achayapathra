
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HeartHandshake,
  LayoutDashboard,
  Gift,
  Trophy,
  BarChart,
  Users,
  Hand,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/donations/list', label: 'All Donations', icon: Gift },
  { href: '/impact', label: 'Our Impact', icon: BarChart },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const secondaryNavItems = [
    { href: '/receiver-dashboard', label: 'Find Food', icon: Users },
    { href: '/volunteer-dashboard', label: 'Volunteer', icon: Hand },
]

function NavItem({ href, label, icon: Icon, isActive }: { href: string, label: string, icon: React.ElementType, isActive: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
        isActive && 'bg-muted text-primary'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function SidebarNavContent() {
  const pathname = usePathname();
  const { user } = useUser();

  if (!user) {
    return (
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
            <HeartHandshake className="h-6 w-6 text-primary" />
            <span>achayapathra</span>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
          <HeartHandshake className="h-6 w-6 text-primary" />
          <span>achayapathra</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname.startsWith(item.href)}
            />
          ))}
          <hr className="my-2" />
          {secondaryNavItems.map((item) => (
             <NavItem
             key={item.href}
             href={item.href}
             label={item.label}
             icon={item.icon}
             isActive={pathname.startsWith(item.href)}
           />
          ))}
           <hr className="my-2" />
           <NavItem
                href="/settings"
                label="Settings"
                icon={Settings}
                isActive={pathname.startsWith('/settings')}
            />
        </nav>
      </div>
    </>
  );
}


export function SidebarNav() {
  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <SidebarNavContent />
    </div>
  );
}
