'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartHandshake, LayoutGrid, Sparkles, Trophy } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Separator } from '../ui/separator';
import { UserNav } from '../user-nav';

const navItems = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/donations', icon: HeartHandshake, label: 'Donations' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/impact', icon: Sparkles, label: 'Our Impact' },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold font-headline text-lg text-primary-foreground group-data-[collapsible=icon]:hidden"
        >
          <HeartHandshake className="text-accent" />
          <span>SharePlate</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <Separator className="my-2 bg-sidebar-border" />
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  );
}
