"use client";

import { AppHeader } from './app-header';

interface AppShellProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

export const AppShell = ({ children, hideHeader = false }: AppShellProps) => (
  <div className="min-h-screen bg-background">
    {!hideHeader && <AppHeader />}
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 md:px-6">{children}</main>
  </div>
);
