'use client';

import * as React from 'react';
import Link, { LinkProps } from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type SidebarContextProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const SidebarContext = React.createContext<SidebarContextProps | undefined>(
  undefined
);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

export function Sidebar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { isOpen, setIsOpen } = useSidebar();
  return (
    <>
      <div
        onClick={() => setIsOpen(false)}
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      />
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {children}
      </aside>
    </>
  );
}

export function SidebarHeader({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex h-14 items-center gap-2 border-b px-4 lg:h-[60px] lg:px-6',
        className
      )}
    >
      {children}
    </div>
  );
}

export function SidebarContent({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex-1', className)}>
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
        {children}
      </nav>
    </div>
  );
}

export function SidebarFooter({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-auto border-t p-4', className)}>{children}</div>
  );
}

export function SidebarNav({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <nav
      className={cn(
        'flex flex-col gap-1 px-2 py-4 text-sm font-medium',
        className
      )}
    >
      {children}
    </nav>
  );
}

interface SidebarNavItemProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

export function SidebarNavItem({
  children,
  className,
  icon,
  isActive,
  ...props
}: SidebarNavItemProps) {
  return (
    <Link
      {...props}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:text-primary',
        isActive && 'bg-sidebar-accent text-primary',
        className
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

export function SidebarNavSeparator() {
    return <hr className="my-2 border-sidebar-border" />;
}

export function SidebarInset({ children }: { children: React.ReactNode }) {
    const { isOpen } = useSidebar();
    return (
      <div className={cn('transition-[padding]', isOpen && 'md:pl-64')}>
        {children}
      </div>
    );
  }

export function SidebarToggle() {
  const { isOpen, setIsOpen } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="shrink-0"
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle navigation menu</span>
    </Button>
  );
}
