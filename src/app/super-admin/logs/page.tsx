'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppState } from '@/providers/app-state-provider';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function SuperAdminLogsPage() {
  const { state } = useAppState();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading } = useDoc<UserProfile>(userDocRef);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || profile.role !== 'super-admin') {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Super admin access required.
      </div>
    );
  }

  return (
    <>
      <Header title="Activity logs" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Latest actions</CardTitle>
            <CardDescription>Audit trail across menu, orders, and canteen changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Metadata</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.activityLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      No activity recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  state.activityLogs.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        {entry.actor.name}
                        <span className="block text-xs text-muted-foreground">{entry.actor.role}</span>
                      </TableCell>
                      <TableCell>{entry.action}</TableCell>
                      <TableCell>
                        <pre className="max-w-xs overflow-x-auto rounded bg-slate-100 p-2 text-[10px] leading-tight text-slate-600">
                          {JSON.stringify(entry.metadata ?? {}, null, 2)}
                        </pre>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
