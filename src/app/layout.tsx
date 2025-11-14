
'use client';

import { useEffect } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useUser } from '@/firebase/client-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { BottomNav } from '@/components/layout/bottom-nav';
import { usePathname } from 'next/navigation';
import { AppStateProvider } from '@/providers/app-state-provider';
import { CartProvider, useCart } from '@/providers/cart-provider';

const inter = Inter({ subsets: ['latin'] });

// This is a client component because it uses usePathname and useUser
function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const { setCartOwner } = useCart();

  useEffect(() => {
    setCartOwner(user ? user.uid : null);
  }, [user, setCartOwner]);

  const isPublicPage = ['/', '/signup', '/login'].includes(pathname);
  const showNav = !isUserLoading && user && !isPublicPage;

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {showNav && (
          <div className="hidden border-r bg-muted/40 md:block">
            <SidebarNav />
          </div>
        )}
        <div className="flex flex-col">
          <main className="flex flex-1 flex-col pb-16 md:pb-0">
            {children}
          </main>
        </div>
      </div>
      {showNav && <BottomNav />}
    </SidebarProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const metadata: Metadata = {
    title: 'SharePlate',
    description: 'Building Humanity Through Sharing',
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className}`}>
        <FirebaseClientProvider>
          <AppStateProvider>
            <CartProvider>
              <AppLayout>{children}</AppLayout>
            </CartProvider>
          </AppStateProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
