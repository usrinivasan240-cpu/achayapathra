'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  Building2,
  ChefHat,
  ClipboardList,
  History,
  Home,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Timer,
  User,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile, UserRole } from '@/lib/types';

type NavItemConfig = {
  href: string;
  label: string;
  icon: React.ElementType;
};

type NavSections = {
  primary: NavItemConfig[];
  secondary: NavItemConfig[];
};

const studentNav: NavSections = {
  primary: [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/orders', label: 'Track', icon: Timer },
    { href: '/cart', label: 'Cart', icon: ShoppingCart },
    { href: '/history', label: 'History', icon: History },
    { href: '/profile', label: 'Profile', icon: User },
  ],
  secondary: [],
};

const adminNav: NavSections = {
  primary: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: ShieldCheck },
    { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
    { href: '/admin/menu', label: 'Menu', icon: ChefHat },
    { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ],
  secondary: [],
};

const superAdminNav: NavSections = {
  primary: [
    { href: '/super-admin/dashboard', label: 'Overview', icon: ShieldCheck },
    { href: '/super-admin/canteens', label: 'Canteens', icon: Building2 },
    { href: '/super-admin/admins', label: 'Admins', icon: UserCog },
    { href: '/super-admin/logs', label: 'Activity', icon: ScrollText },
    { href: '/settings', label: 'Settings', icon: Settings },
  ],
  secondary: [],
};

const getNavForRole = (role: UserRole | undefined): NavSections => {
  switch (role) {
    case 'admin':
      return adminNav;
    case 'super-admin':
      return superAdminNav;
    case 'student':
    default:
      return studentNav;
  }
};

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile } = useDoc<UserProfile>(userDocRef);
  const sections = getNavForRole(profile?.role ?? (user ? 'student' : undefined));

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 w-full border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-5">
        {sections.primary.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
