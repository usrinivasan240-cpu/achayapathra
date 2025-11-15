"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChefHat, LogOut, MoonStar, SunMedium } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CartDrawer } from '@/components/canteen/cart/cart-drawer';
import { useAuth } from '@/contexts/auth-context';

export const AppHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    if (typeof window === 'undefined') return;
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href={isAdmin ? '/admin/dashboard' : '/home'} className="flex items-center gap-2 font-semibold">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl">ShareBite Canteen</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {!isAdmin && (
            <>
              <Link href="/home" className={pathname === '/home' ? 'text-primary' : 'text-muted-foreground'}>
                Menu
              </Link>
              <Link href="/orders" className={pathname === '/orders' ? 'text-primary' : 'text-muted-foreground'}>
                Order history
              </Link>
              <Link href="/cart" className={pathname === '/cart' ? 'text-primary' : 'text-muted-foreground'}>
                Cart
              </Link>
              <Link href="/track-order" className={pathname.startsWith('/track-order') ? 'text-primary' : 'text-muted-foreground'}>
                Track order
              </Link>
              <Link href="/profile" className={pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'}>
                Profile
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link
                href="/admin/dashboard"
                className={pathname === '/admin/dashboard' ? 'text-primary' : 'text-muted-foreground'}
              >
                Dashboard
              </Link>
              <Link href="/admin/orders" className={pathname === '/admin/orders' ? 'text-primary' : 'text-muted-foreground'}>
                Orders
              </Link>
              <Link href="/admin/items" className={pathname === '/admin/items' ? 'text-primary' : 'text-muted-foreground'}>
                Menu items
              </Link>
              <Link href="/admin/reports" className={pathname === '/admin/reports' ? 'text-primary' : 'text-muted-foreground'}>
                Reports
              </Link>
              <Link href="/admin/settings" className={pathname === '/admin/settings' ? 'text-primary' : 'text-muted-foreground'}>
                Settings
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {isDarkMode ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
          </Button>
          {!isAdmin && <CartDrawer />}
          {user ? (
            <Button variant="outline" className="hidden gap-2 text-sm md:flex" onClick={handleLogout}>
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
