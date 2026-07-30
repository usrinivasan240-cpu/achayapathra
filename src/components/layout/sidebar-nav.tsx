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
  MapPin,
  Truck,
  Bell,
  Award,
  Flame,
  AlertTriangle,
  Leaf,
  QrCode,
  Search,
  Map,
  Building2,
  Landmark,
  Wallet,
  User,
  FileText,
  Zap,
  Globe,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/language-context';
import * as React from 'react';

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
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <>
      <div className="my-3 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</div>
      {children}
    </>
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
  const isCorporate = profile?.role === 'corporate' || isAdmin;
  const isGovernment = profile?.role === 'government' || isAdmin;

  return (
    <>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
          <HeartHandshake className="h-6 w-6 text-primary" />
          <span>{t('header.title')}</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1 mt-4 pb-4">
          <NavSection title="Core">
            <NavItem href="/dashboard" label={t('nav.dashboard')} icon={LayoutDashboard} isActive={pathname === '/dashboard'} />
            <NavItem href="/donations/list" label={t('nav.donations')} icon={Gift} isActive={pathname.startsWith('/donations')} />
            <NavItem href="/impact" label={t('nav.impact')} icon={BarChart} isActive={pathname === '/impact'} />
            <NavItem href="/leaderboard" label={t('nav.leaderboard')} icon={Trophy} isActive={pathname === '/leaderboard'} />
          </NavSection>

          <NavSection title="Services">
            {isNGO && (
              <NavItem href="/ngo" label={t('nav.ngoPortal')} icon={ShieldCheck} isActive={pathname.startsWith('/ngo')} isFeatured />
            )}
            {isCorporate && (
              <NavItem href="/corporate-dashboard" label="Corporate Dashboard" icon={Building2} isActive={pathname.startsWith('/corporate-dashboard')} isFeatured />
            )}
            {isGovernment && (
              <NavItem href="/government-dashboard" label="Government Dashboard" icon={Landmark} isActive={pathname.startsWith('/government-dashboard')} isFeatured />
            )}
            <NavItem href="/receiver-dashboard" label={t('nav.findFood')} icon={Users} isActive={pathname === '/receiver-dashboard'} />
            <NavItem href="/volunteer-dashboard" label={t('nav.volunteer')} icon={Hand} isActive={pathname === '/volunteer-dashboard'} />
            <NavItem href="/volunteer-profile" label="Volunteer Profile" icon={User} isActive={pathname === '/volunteer-profile'} />
          </NavSection>

          <NavSection title="AI & Intelligence">
            <NavItem href="/ai-insights" label="AI Insights Hub" icon={Cpu} isActive={pathname === '/ai-insights'} />
            <NavItem href="/future-intelligence" label="Future Intelligence" icon={Zap} isActive={pathname === '/future-intelligence'} />
            <NavItem href="/food-safety" label="Food Safety AI" icon={ShieldCheck} isActive={pathname === '/food-safety'} />
            <NavItem href="/carbon-dashboard" label="Carbon Dashboard" icon={Leaf} isActive={pathname === '/carbon-dashboard'} />
          </NavSection>

          <NavSection title="Tracking & Verification">
            <NavItem href="/tracking" label="Donation Tracking" icon={Truck} isActive={pathname === '/tracking'} />
            <NavItem href="/live-maps" label="Live Maps" icon={Map} isActive={pathname === '/live-maps'} />
            <NavItem href="/qr-verification" label="QR Verification" icon={QrCode} isActive={pathname === '/qr-verification'} />
          </NavSection>

          <NavSection title="Centre">
            <NavItem href="/notifications" label="Notifications" icon={Bell} isActive={pathname === '/notifications'} />
            <NavItem href="/certificates" label="Certificates" icon={Award} isActive={pathname === '/certificates'} />
            <NavItem href="/rewards" label="Rewards & Gamification" icon={Flame} isActive={pathname === '/rewards'} />
            <NavItem href="/emergency" label="Emergency Centre" icon={AlertTriangle} isActive={pathname === '/emergency'} />
            <NavItem href="/complaints" label="Complaint System" icon={MessageSquare} isActive={pathname === '/complaints'} />
          </NavSection>

          {isAdmin && (
            <NavSection title="Administration">
              <NavItem href="/admin" label="Admin Panel" icon={ShieldCheck} isActive={pathname === '/admin'} isFeatured />
              <NavItem href="/revenue-dashboard" label="Revenue Dashboard" icon={Wallet} isActive={pathname === '/revenue-dashboard'} />
            </NavSection>
          )}

          <NavSection title="Platform">
            <NavItem href="/public-impact" label="Public Impact" icon={Globe} isActive={pathname === '/public-impact'} />
            <NavItem href="/team" label={t('nav.team')} icon={MessageSquare} isActive={pathname === '/team'} />
            <NavItem href="/settings" label={t('nav.settings')} icon={Settings} isActive={pathname === '/settings'} />
          </NavSection>
        </nav>
      </div>
      <div className="p-4 border-t text-[10px] text-muted-foreground uppercase text-center font-bold tracking-widest">
        Achayapathra v3.0 — Circular Food Economy
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
