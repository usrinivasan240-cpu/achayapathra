'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DonationsNewPlaceholder() {
  return (
    <>
      <Header title="Legacy donation form" />
      <main className="flex flex-1 items-center justify-center bg-muted/30 p-8">
        <Card className="max-w-lg text-center">
          <CardHeader>
            <CardTitle>Food donation module sunset</CardTitle>
            <CardDescription>
              Achayapathra now focuses on campus canteen ordering with live tracking and revenue analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild>
              <Link href="/dashboard">Explore the canteen app</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
