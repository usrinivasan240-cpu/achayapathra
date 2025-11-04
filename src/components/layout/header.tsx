
import { SidebarToggle } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';

export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarToggle />
      <h1 className="text-xl font-semibold font-headline">{title}</h1>
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Future search bar can go here */}
      </div>
      <UserNav />
    </header>
  );
}
