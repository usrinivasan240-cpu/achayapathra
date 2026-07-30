'use client';

import { Menu, Zap, Languages } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import { SidebarNavContent } from './sidebar-nav';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { SystemSettings } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useLanguage } from '@/contexts/language-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header({ title }: { title: string }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { language, setLanguage, t } = useLanguage();
  
  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'system_settings', 'global');
  }, [firestore, user]);
  
  const { data: settings, isLoading } = useDoc<SystemSettings>(settingsRef);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <SidebarNavContent />
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1 flex items-center gap-4">
        <h1 className="text-xl font-semibold font-headline">{title}</h1>
        {!isLoading && settings?.emergencyMode && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive text-white text-[10px] font-bold uppercase animate-pulse border-2 border-white/20 shadow-lg">
            <Zap className="h-3 w-3 fill-white" />
            Emergency Redistribution Active
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex mr-4 text-xs font-medium text-muted-foreground italic">
          "{t('header.tagline')}"
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Languages className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-muted' : ''}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('ta')} className={language === 'ta' ? 'bg-muted' : ''}>
              தமிழ் (Tamil)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <UserNav />
      </div>
    </header>
  );
}
