'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import {
  Loader2,
  MapPin,
  Package,
  Clock,
  ShieldCheck,
  ClipboardCheck,
  Truck,
  CheckCircle2,
  History,
  QrCode,
} from 'lucide-react';

import {
  useDoc,
  useFirestore,
  useMemoFirebase,
  useUser,
  errorEmitter,
  FirestorePermissionError,
} from '@/firebase';
import { Donation } from '@/lib/types';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DonationDetailsPage() {
  const params = useParams();
  const { id } = params;
  const firestore = useFirestore();
  const { user } = useUser();
  const [isClaiming, setIsClaiming] = React.useState(false);

  const donationDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'donations', id as string);
  }, [firestore, id]);

  const {
    data: donation,
    isLoading,
    error,
  } = useDoc<Donation>(donationDocRef);

  const handleUpdateStatus = (newStatus: Donation['status']) => {
    if (!firestore || !user || !id) return;
    setIsClaiming(true);
    const donationRef = doc(firestore, 'donations', id as string);
    const updateData = { status: newStatus, ...(newStatus === 'Claimed' ? { claimedBy: user.uid } : {}) };

    updateDoc(donationRef, updateData)
      .catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: donationRef.path,
          operation: 'update',
          requestResourceData: updateData,
        }));
      })
      .finally(() => {
        setIsClaiming(false);
      });
  };

  if (isLoading) return <><Header title="Donation Details" /><div className="flex flex-1 items-center justify-center h-[50vh]"><Loader2 className="h-8 w-8 animate-spin" /></div></>;
  if (!donation) return <><Header title="Not Found" /><div className="flex flex-1 items-center justify-center h-[50vh]"><p>Donation not found.</p></div></>;

  const timeline = [
    { status: 'Available', icon: History, date: donation.createdAt },
    { status: 'Claimed', icon: ClipboardCheck, active: donation.status === 'Claimed' || donation.status === 'Picked Up' || donation.status === 'Delivered' },
    { status: 'Picked Up', icon: Truck, active: donation.status === 'Picked Up' || donation.status === 'Delivered' },
    { status: 'Delivered', icon: CheckCircle2, active: donation.status === 'Delivered' },
  ];

  return (
    <>
      <Header title={`Track #${donation.trackingId || 'N/A'}`} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-8">
        
        {/* Tracking Timeline */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground text-center md:text-left">Traceability Timeline</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-6 md:px-6">
            <div className="relative flex justify-between items-center max-w-2xl mx-auto px-4">
              <div className="absolute left-6 right-6 top-[22px] h-0.5 bg-muted z-0" />
              {timeline.map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center gap-1.5 md:gap-2">
                  <div className={`p-1.5 md:p-2 rounded-full border bg-background transition-colors ${step.active || donation.status === step.status ? "border-primary text-primary" : "text-muted-foreground"}`}>
                    <step.icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-tight text-center ${step.active || donation.status === step.status ? "text-primary" : "text-muted-foreground"}`}>
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 md:space-y-8">
            <Card className="overflow-hidden">
              {donation.imageURL && (
                <div className="relative w-full aspect-video md:h-64">
                  <Image src={donation.imageURL} alt={donation.foodName} fill style={{ objectFit: 'cover' }} />
                </div>
              )}
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl md:text-3xl font-headline leading-tight">{donation.foodName}</CardTitle>
                    <div className="flex gap-2 items-center text-[10px] font-mono bg-muted px-2 py-1 rounded w-fit">
                      <QrCode className="h-3 w-3" />
                      ID: {donation.trackingId || donation.id.substring(0,8)}
                    </div>
                  </div>
                  <Badge variant={donation.status === 'Available' ? 'default' : 'secondary'} className="shrink-0">{donation.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-6">
                {donation.ai_matching_score && (
                   <Alert className="bg-primary/5 border-primary/20">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-sm font-bold">Smart Matching Intelligence</AlertTitle>
                    <AlertDescription className="text-xs">
                      This donation has a matching score of <span className="font-bold">{donation.ai_matching_score}%</span>. 
                      Priority: {donation.ai_matching_score > 80 ? "Critical" : "Standard"}.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-6 text-sm">
                   <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-primary shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Quantity</p>
                      <p className="font-semibold text-sm">{donation.quantity}</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Expires</p>
                      <p className="font-semibold text-sm">{donation.expiryTime?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tracking Logs</h4>
                  <ul className="text-xs space-y-2 font-medium">
                    <li className="flex items-center gap-2">• <span className="text-muted-foreground">Serialized:</span> {donation.createdAt?.toDate().toLocaleString()}</li>
                    {donation.status !== 'Available' && <li className="flex items-center gap-2">• <span className="text-muted-foreground">Matched:</span> {donation.claimedBy?.substring(0,12)}...</li>}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-4 md:space-y-6">
             <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="font-headline text-xl">Pickup Location</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl border">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm font-medium leading-relaxed">{donation.location}</p>
                </div>
                <Button variant="outline" className="w-full h-11" asChild>
                  <Link href={`https://www.google.com/maps/search/?api=1&query=${donation.lat},${donation.lng}`} target="_blank">
                    Open in Maps
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="sticky bottom-20 md:static">
              {donation.status === 'Available' && (
                <Button size="lg" className="w-full h-14 text-lg font-bold shadow-xl" onClick={() => handleUpdateStatus('Claimed')} disabled={isClaiming}>
                  {isClaiming ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Claim Donation"}
                </Button>
              )}
               {donation.status === 'Claimed' && (
                <Button size="lg" className="w-full h-14 text-lg font-bold shadow-xl" onClick={() => handleUpdateStatus('Picked Up')} disabled={isClaiming}>
                  {isClaiming ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Mark as Picked Up"}
                </Button>
              )}
               {donation.status === 'Picked Up' && (
                <Button size="lg" className="w-full h-14 text-lg font-bold shadow-xl" onClick={() => handleUpdateStatus('Delivered')} disabled={isClaiming}>
                  {isClaiming ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Confirm Delivery"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
