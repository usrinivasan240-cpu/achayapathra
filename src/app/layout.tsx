
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider, useUser } from '@/firebase/client-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { BottomNav } from '@/components/layout/bottom-nav';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const isPublicPage = ['/', '/signup'].includes(pathname);

  // Centralized redirect logic
  useEffect(() => {
    if (isUserLoading) return; // Wait until auth state is confirmed

    // If logged out and on a private page, redirect to login
    if (!user && !isPublicPage) {
      router.push('/');
    }

    // If logged in and on a public page, redirect to dashboard
    if (user && isPublicPage) {
      router.push('/dashboard');
    }
  }, [isUserLoading, user, isPublicPage, router, pathname]);

  // Show a global loading spinner while authentication is in progress.
  // This prevents rendering pages that rely on auth state before it's ready.
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // For unauthenticated users on public pages, render the content directly
  // without the main app navigation shell.
  if (!user && isPublicPage) {
    return <>{children}</>;
  }

  // For authenticated users, render the full application layout with navigation.
  if (user && !isPublicPage) {
    return (
      <SidebarProvider>
        <div className="md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <div className="hidden border-r bg-muted/40 md:block">
            <SidebarNav />
          </div>
          <div className="flex flex-col">
            <main className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">
              {children}
            </main>
          </div>
        </div>
        <BottomNav />
      </SidebarProvider>
    );
  }

  // This is a fallback case, e.g. for a logged-out user on a private page
  // before the redirect kicks in. It shows a loader to prevent errors.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Achayapathra</title>
        <meta
          name="description"
          content="Building Humanity Through Sharing"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className}`}>
        <FirebaseClientProvider>
          <AppLayout>{children}</AppLayout>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
