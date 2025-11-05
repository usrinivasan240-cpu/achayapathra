
'use client';

import { Header } from '@/components/layout/header';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const VolunteerContent = dynamic(
  () => import('./volunteer-content').then((mod) => mod.VolunteerContent),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
);

export default function VolunteerDashboardPage() {
  return (
    <>
      <Header title="Volunteer Dashboard" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <VolunteerContent />
      </main>
    </>
  );
}
