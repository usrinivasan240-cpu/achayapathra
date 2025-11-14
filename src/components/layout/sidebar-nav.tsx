'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  Building2,
  ChefHat,
  ClipboardList,
  HeartHandshake,
  History,
  Home,
  MessageSquareQuote,
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

const studentNav = {
  primary: [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/orders', label: 'Track Orders', icon: Timer },
    { href: '/cart', label: 'My Cart', icon: ShoppingCart },
    { href: '/history', label: 'Order History', icon: History },
  ],
  secondary: [
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/feedback', label: 'Feedback', icon: MessageSquareQuote },
  ],
};

const adminNav = {
  primary: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: ShieldCheck },
    { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
    { href: '/admin/menu', label: 'Menu Items', icon: ChefHat },
    { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
  ],
  secondary: [{ href: '/admin/settings', label: 'Settings', icon: Settings }],
};

const superAdminNav = {
  primary: [
    { href: '/super-admin/dashboard', label: 'Overview', icon: ShieldCheck },
    { href: '/super-admin/canteens', label: 'Canteens', icon: Building2 },
    { href: '/super-admin/admins', label: 'Admins', icon: UserCog },
    { href: '/super-admin/logs', label: 'Activity Logs', icon: ScrollText },
  ],
  secondary: [{ href: '/settings', label: 'Platform Settings', icon: Settings }],
};

type NavItemConfig = {
  href: string;
  label: string;
  icon: React.ElementType;
};

type NavSections = {
  primary: NavItemConfig[];
  secondary: NavItemConfig[];
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

function NavItem({ href, label, icon: Icon, isActive }: NavItemConfig & { isActive: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground',
        isActive && 'bg-primary/10 text-primary'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export function SidebarNavContent() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile } = useDoc<UserProfile>(userDocRef);
  const sections = getNavForRole(profile?.role ?? (user ? 'student' : undefined));

  return (
    <>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
          <HeartHandshake className="h-6 w-6 text-primary" />
          <span>achayapathra</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4">
          {sections.primary.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            />
          ))}
          {sections.secondary.length > 0 && <hr className="my-3" />}
          {sections.secondary.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            />
          ))}
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
