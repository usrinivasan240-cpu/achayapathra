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
  ShieldCheck,
  MessageSquare,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/language-context';

function NavItem({ href, label, icon: Icon, isActive, isFeatured }: { href: string, label: string, icon: React.ElementType, isActive: boolean, isFeatured?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
        isActive && 'bg-muted text-primary font-medium',
        isFeatured && 'bg-primary/10 text-primary font-bold hover:bg-primary/20 border-l-4 border-primary'
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
  const firestore = useFirestore();
  const { isAdmin } = useAdmin();
  const { t } = useLanguage();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: profile } = useDoc<UserProfile>(userDocRef);

  if (!user) {
    return (
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
            <HeartHandshake className="h-6 w-6 text-primary" />
            <span>{t('header.title')}</span>
            </Link>
        </div>
      </div>
    );
  }

  const isNGO = profile?.role === 'ngo' || isAdmin;

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/donations/list', label: t('nav.donations'), icon: Gift },
    { href: '/impact', label: t('nav.impact'), icon: BarChart },
    { href: '/leaderboard', label: t('nav.leaderboard'), icon: Trophy },
  ];

  return (
    <>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
          <HeartHandshake className="h-6 w-6 text-primary" />
          <span>{t('header.title')}</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
            />
          ))}
          
          <div className="my-4 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('nav.services')}</div>
          
          {isNGO && (
            <NavItem
              href="/ngo"
              label={t('nav.ngoPortal')}
              icon={ShieldCheck}
              isActive={pathname.startsWith('/ngo')}
              isFeatured
            />
          )}

          <NavItem
            href="/receiver-dashboard"
            label={t('nav.findFood')}
            icon={Users}
            isActive={pathname === '/receiver-dashboard'}
          />
          <NavItem
            href="/volunteer-dashboard"
            label={t('nav.volunteer')}
            icon={Hand}
            isActive={pathname === '/volunteer-dashboard'}
          />

           <div className="my-4 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI & COORDINATION</div>
            <NavItem
                href="/future-intelligence"
                label="Future Intelligence"
                icon={Cpu}
                isActive={pathname === '/future-intelligence'}
            />
           <NavItem
                href="/team"
                label={t('nav.team')}
                icon={MessageSquare}
                isActive={pathname === '/team'}
            />
           <NavItem
                href="/settings"
                label={t('nav.settings')}
                icon={Settings}
                isActive={pathname === '/settings'}
            />
        </nav>
      </div>
      <div className="p-4 border-t text-[10px] text-muted-foreground uppercase text-center font-bold tracking-widest">
        Rapid Response v2.0
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
