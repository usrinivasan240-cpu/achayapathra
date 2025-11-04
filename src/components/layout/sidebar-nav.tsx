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
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNavItem,
  SidebarNavSeparator,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/donations', label: 'My Donations', icon: Gift },
  { href: '/impact', label: 'Our Impact', icon: BarChart },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const secondaryNavItems = [
    { href: '/receiver-dashboard', label: 'Find Food', icon: Users },
    { href: 'volunteer-dashboard', label: 'Volunteer', icon: Hand },
]

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <HeartHandshake className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold font-headline">SharePlate</span>
      </SidebarHeader>
      <SidebarContent>
        <nav className="flex flex-col gap-1 px-2 py-4 text-sm font-medium">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              icon={<item.icon className="h-4 w-4" />}
              isActive={pathname.startsWith(item.href)}
            >
              {item.label}
            </SidebarNavItem>
          ))}
          <SidebarNavSeparator />
           {secondaryNavItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              icon={<item.icon className="h-4 w-4" />}
              isActive={pathname.startsWith(item.href)}
            >
              {item.label}
            </SidebarNavItem>
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  );
}
