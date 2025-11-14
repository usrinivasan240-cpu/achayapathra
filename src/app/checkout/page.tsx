'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { CreditCard, Loader2, Sparkles, Wallet } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/providers/cart-provider';
import { useAppState } from '@/providers/app-state-provider';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const paymentOptions: Array<{ id: 'UPI' | 'Card' | 'Wallet'; label: string; description: string; icon: React.ReactNode }> = [
  { id: 'UPI', label: 'UPI', description: 'Pay using PhonePe / Google Pay simulation', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'Card', label: 'Card', description: 'Debit or Credit card checkout simulation', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'Wallet', label: 'Campus Wallet', description: 'Use campus wallet credits', icon: <Wallet className="h-4 w-4" /> },
];

function ConfettiCanvas() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 24 }).map((_, index) => (
        <span
          key={index}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 1.5}s`,
            backgroundColor: ['#22d3ee', '#facc15', '#34d399', '#fb7185'][index % 4],
          }}
        />
      ))}
      <style jsx>{`
        .confetti-piece {
          position: absolute;
          top: -10px;
          width: 8px;
          height: 16px;
          opacity: 0;
          animation: confetti-fall 2.4s ease-in-out forwards;
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(240deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totals, clearCart, couponCode } = useCart();
  const { placeOrder, state } = useAppState();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile } = useDoc<UserProfile>(userDocRef);

  const [notes, setNotes] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<'UPI' | 'Card' | 'Wallet'>('UPI');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [confirmationOrderId, setConfirmationOrderId] = React.useState<string | null>(null);

  const confirmedOrder = React.useMemo(
    () => state.orders.find((order) => order.id === confirmationOrderId),
    [confirmationOrderId, state.orders]
  );

  React.useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart');
    }
  }, [items, router]);

  if (!user || items.length === 0) {
    return null;
  }

  const firstMenuItem = state.menuItems.find((entry) => entry.id === items[0]?.menuItemId);
  const canteenId = firstMenuItem?.canteenId ?? profile?.canteenId ?? 'canteen-central';
  const counterId = firstMenuItem?.counterId ?? profile?.counterId ?? 'central-counter-1';

  const handleSubmit = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const order = placeOrder({
        actor: {
          id: user.uid,
          name: profile?.displayName ?? user.email ?? 'Student',
          role: profile?.role ?? 'student',
        },
        canteenId,
        counterId,
        items,
        couponCode,
        notes,
        paymentMethod,
      });
      clearCart();
      setConfirmationOrderId(order.id);
      toast({
        title: 'Payment successful',
        description: `Token ${order.tokenNumber} generated. Track the order in real time.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'We could not process the order',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Header title="Checkout" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl">Confirm payment</CardTitle>
              <CardDescription>
                Complete your simulated payment to generate the pick-up token instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Select payment method
                </label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as typeof paymentMethod)}
                  className="grid gap-3 md:grid-cols-3"
                >
                  {paymentOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm transition ${
                        paymentMethod === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-primary/40'
                      }`}
                    >
                      <RadioGroupItem value={option.id} className="mt-1" />
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 font-semibold text-slate-800">
                          {option.icon}
                          {option.label}
                        </p>
                        <p className="text-xs text-slate-500">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notes for counter
                </label>
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Mention spice preferences or allergies"
                  rows={3}
                />
              </div>

              <div className="grid gap-3 text-sm text-slate-600">
                {items.map((item) => {
                  const menuItem = state.menuItems.find((entry) => entry.id === item.menuItemId);
                  if (!menuItem) return null;
                  return (
                    <div key={item.menuItemId} className="flex justify-between">
                      <span>
                        {item.qty} × {menuItem.name}
                      </span>
                      <span>₹{(menuItem.price * item.qty).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-slate-500">
                  <span>GST</span>
                  <span>₹{totals.gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Service charge</span>
                  <span>₹{totals.serviceCharge.toFixed(2)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-₹{totals.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-3 text-base font-semibold text-slate-800">
                  <span>Amount payable</span>
                  <span>₹{totals.total.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pay & generate token
              </Button>
              <p className="text-xs text-slate-500">
                Payments are simulated. The system automatically marks the order as paid and routes it to the assigned counter.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Pickup summary</CardTitle>
              <CardDescription>
                Collect from {counterId.replace(/-/g, ' ')} in {canteenId.replace(/-/g, ' ')}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">Order overview</p>
                <p className="text-xs text-slate-500">
                  {items.length} items • Payable ₹{totals.total.toFixed(2)}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Popular coupons
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {state.coupons.map((coupon) => (
                    <span key={coupon.code} className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-2xs uppercase tracking-wide text-slate-500">
                      {coupon.code}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Orders auto-cancel if not collected within 20 minutes of being marked ready.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={Boolean(confirmedOrder)} onOpenChange={(open) => !open && setConfirmationOrderId(null)}>
        <DialogContent className="max-w-md overflow-hidden">
          <ConfettiCanvas />
          {confirmedOrder && (
            <div className="relative">
              <DialogHeader className="space-y-2 text-center">
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  Payment complete
                </DialogTitle>
                <DialogDescription>
                  Show this QR code at the counter. Live updates available in the tracker.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 flex flex-col items-center gap-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-inner">
                  <QRCode value={confirmedOrder.tokenNumber} size={160} fgColor="#2563eb" />
                </div>
                <p className="text-lg font-semibold text-slate-800">
                  Token {confirmedOrder.tokenNumber}
                </p>
                <div className="w-full space-y-2 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>₹{confirmedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Counter</span>
                    <span>{confirmedOrder.counterId.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span>{confirmedOrder.status}</span>
                  </div>
                </div>
                <div className="flex w-full gap-2">
                  <Button className="flex-1" onClick={() => router.push(`/orders/${confirmedOrder.id}`)}>
                    Track order
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setConfirmationOrderId(null);
                      router.push('/dashboard');
                    }}
                  >
                    Continue browsing
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
