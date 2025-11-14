'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DonationDetailPlaceholder() {
  return (
    <>
      <Header title="Legacy donation details" />
      <main className="flex flex-1 items-center justify-center bg-muted/30 p-8">
        <Card className="max-w-lg text-center">
          <CardHeader>
            <CardTitle>Module retired</CardTitle>
            <CardDescription>
              Detailed donation tracking has been superseded by the multi-role canteen order tracker.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild>
              <Link href="/orders">View active orders</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
