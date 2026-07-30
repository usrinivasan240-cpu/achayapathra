'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Loader2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc, limit } from 'firebase/firestore';
import { DemandRequest, UserProfile, Donation } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function NGODashboard() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  
  const { data: profile, isLoading: profileLoading } = useDoc<UserProfile>(userDocRef);

  // 1. NGO's active requirements - strictly filtered by ngoId to match security rules
  const demandsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'ngo_demands'),
      where('ngoId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: demands, isLoading: demandsLoading, error: demandsError } = useCollection<DemandRequest>(demandsQuery);

  // 2. Donations available for matching
  const availableDonationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'donations'),
      where('status', '==', 'Available'),
      limit(50)
    );
  }, [firestore, user]);

  const { data: allAvailable, isLoading: matchesLoading } = useCollection<Donation>(availableDonationsQuery);

  const smartMatches = React.useMemo(() => {
    if (!allAvailable || !demands) return [];
    const myDemandIds = demands.map(d => d.id);
    return allAvailable.filter(donation => 
      donation.matching_metadata?.matched_demands?.some(id => myDemandIds.includes(id))
    );
  }, [allAvailable, demands]);

  if (isUserLoading || profileLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthorized = profile?.role === 'ngo' || user?.email === "usrinivasan240@gmail.com";

  if (!user || !isAuthorized) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-muted/20 min-h-screen">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-3xl font-bold font-headline">NGO Access Required</h2>
        <p className="text-muted-foreground mt-4 max-w-md">
          This portal is reserved for registered NGO partners. If you represent an organization, please register an NGO account to access these features.
        </p>
        <div className="flex gap-4 mt-8">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button onClick={() => router.push('/signup')}>
              Register as NGO
            </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header title="NGO Demand Center" />
      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold font-headline text-primary">Requirement Center</h2>
            <p className="text-muted-foreground">Pre-book food needs for prioritized AI matching.</p>
          </div>
          <Link href="/ngo/demand/new">
            <Button size="lg" className="shadow-lg">
              <Plus className="mr-2 h-5 w-5" />
              New Requirement
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Zap className="h-4 w-4" /> Smart Matches
            </TabsTrigger>
            <TabsTrigger value="demands" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> My Demands
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            <Card className="border-primary/20 shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Prioritized Matching Results
                </CardTitle>
                <CardDescription>Donations that match your active requirements first.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {matchesLoading || demandsLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : smartMatches.length > 0 ? (
                  <div className="divide-y">
                    {smartMatches.map(match => (
                      <div key={match.id} className="p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-xl">{match.foodName}</span>
                            <Badge className="bg-green-500 hover:bg-green-600">AI MATCHED</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-medium"><TrendingUp className="h-4 w-4" /> {match.quantity}</span>
                            <span className="flex items-center gap-1.5 font-medium"><MapPin className="h-4 w-4" /> {match.location}</span>
                            <span className="flex items-center gap-1.5 font-medium"><Clock className="h-4 w-4" /> Expires: {match.expiryTime?.toDate().toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <Button asChild>
                          <Link href={`/donations/${match.id}`}>
                            View & Claim <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 px-4">
                    <Zap className="h-16 w-16 text-muted/20 mx-auto mb-4" />
                    <p className="text-xl font-headline text-muted-foreground italic">"Searching for prioritized matches..."</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                      When donors list food matching your requirements, they will appear here instantly.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demands">
            <Card>
              <CardHeader>
                <CardTitle>My Active Requirements</CardTitle>
                <CardDescription>Track the status of your organization's food requests.</CardDescription>
              </CardHeader>
              <CardContent>
                {demandsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : demandsError ? (
                  <div className="text-center py-12 text-destructive px-4">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-destructive/50" />
                    <p className="font-semibold">Access Error</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {demandsError.message || "Unable to load requirements. Please check your connection or role."}
                    </p>
                  </div>
                ) : demands && demands.length > 0 ? (
                  <div className="space-y-4">
                    {demands.map(demand => (
                      <div key={demand.id} className="p-4 border rounded-xl bg-card hover:border-primary/50 transition-all shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">{demand.foodType}</span>
                              <Badge variant={demand.urgency === 'Critical' ? 'destructive' : 'secondary'}>
                                {demand.urgency}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 font-semibold"><TrendingUp className="h-3 w-3" /> Qty: {demand.requiredQuantity}</span>
                              <span className="flex items-center gap-1 font-semibold"><Clock className="h-3 w-3" /> Shelf-life: {demand.minShelfLifeHours}h</span>
                              <span className="flex items-center gap-1 font-semibold"><MapPin className="h-3 w-3" /> {demand.location}</span>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1">
                            <Badge className={demand.status === 'Active' ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-muted'}>
                              {demand.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/5">
                    <p className="text-muted-foreground">No active requirements listed yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </main>
    </>
  );
}