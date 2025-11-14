'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DonationsListPlaceholder() {
  return (
    <>
      <Header title="Legacy donations module" />
      <main className="flex flex-1 items-center justify-center bg-muted/30 p-8">
        <Card className="max-w-xl text-center">
          <CardHeader>
            <CardTitle>Canteen-first experience</CardTitle>
            <CardDescription>
              The SharePlate donation hub has been replaced with our canteen ordering workflow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Head to the student dashboard to browse menus, place orders, and manage your canteen activity.
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
