'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Gift,
  User,
  Users,
  ShieldCheck,
  Bell,
  Map,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/language-context';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();
  const { isAdmin } = useAdmin();
  const { t } = useLanguage();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: profile } = useDoc<UserProfile>(userDocRef);

  if (!user) {
    return null;
  }

  const isNGO = profile?.role === 'ngo' || isAdmin;

  const navItems = [
    { href: '/dashboard', label: t('nav.dash'), icon: LayoutDashboard },
    { href: '/donations/list', label: t('nav.gifts'), icon: Gift },
    ...(isNGO ? [{ href: '/ngo', label: 'NGO', icon: ShieldCheck }] : []),
    { href: '/notifications', label: t('nav.notifications'), icon: Bell },
    { href: '/live-maps', label: t('nav.liveMaps'), icon: Map },
    { href: '/profile', label: t('nav.me'), icon: User },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-10 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className={cn("grid h-16 w-full", `grid-cols-${navItems.length}`)}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 p-2 text-[10px] font-medium transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="truncate max-w-[60px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
