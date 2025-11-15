'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Banknote, CreditCard, Loader2, QrCode } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { AppShell } from '@/components/canteen/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';
import { TokenModal } from '@/components/canteen/orders/token-modal';

const checkoutSchema = z.object({
  paymentMethod: z.enum(['upi', 'card']),
  counter: z.string().min(1, 'Select a counter'),
  couponCode: z.string().optional(),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

const availableCounters = [
  { id: 'central', name: 'Central Counter' },
  { id: 'vegan', name: 'Vegan Express' },
  { id: 'grabngo', name: 'Grab & Go' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { items, totals, applyCoupon, clearCart } = useCart();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [tokenNumber, setTokenNumber] = useState<string | null>(null);
  const [tokenQr, setTokenQr] = useState<string | null>(null);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'upi',
      counter: availableCounters[0].id,
      couponCode: '',
    },
  });

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  const totalItems = useMemo(() => items.reduce((acc, item) => acc + item.qty, 0), [items]);

  const handleApplyCoupon = async (code: string | undefined) => {
    if (!code) {
      applyCoupon(null);
      toast({ title: 'Coupon removed' });
      return;
    }

    try {
      const response = await apiClient.post('/coupons/validate', {
        code,
        canteen: user?.canteen,
      });
      const { coupon } = response.data;
      applyCoupon({ code, type: coupon.type, value: coupon.value, maxDiscount: coupon.maxDiscount });
      toast({ title: 'Coupon applied', description: `${code.toUpperCase()} activated.` });
    } catch (error: any) {
      applyCoupon(null);
      toast({
        variant: 'destructive',
        title: 'Invalid coupon',
        description: error?.response?.data?.message || 'Please try a different code.',
      });
    }
  };

  const handlePlaceOrder = async (values: CheckoutValues) => {
    if (items.length === 0) {
      toast({ variant: 'destructive', title: 'Cart is empty', description: 'Add items before checkout.' });
      return;
    }

    try {
      setIsPlacingOrder(true);
      const response = await apiClient.post('/orders/create', {
        canteen: user?.canteen || process.env.NEXT_PUBLIC_DEFAULT_CANTEEN,
        counter: values.counter,
        couponCode: values.couponCode,
        paymentMethod: values.paymentMethod,
        items: items.map((item) => ({ itemId: item.id, qty: item.qty })),
      });

      const order = response.data.order;
      setTokenNumber(order.tokenNumber);
      clearCart();
      setTokenModalOpen(true);

      try {
        const qrResponse = await apiClient.get(`/orders/${order._id}/token`);
        setTokenQr(qrResponse.data.qr);
      } catch (error) {
        setTokenQr(null);
      }

      toast({ title: 'Payment successful', description: 'Your order is now cooking. Bon appétit!' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Unable to place order',
        description: error?.response?.data?.message || 'Please try again shortly.',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
      <AppShell>
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CreditCard className="h-5 w-5 text-primary" /> Payment & pickup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Choose counter
                </h3>
                <Controller
                  control={form.control}
                  name="counter"
                  render={({ field }) => (
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3">
                      {availableCounters.map((counter) => (
                        <Label
                          key={counter.id}
                          htmlFor={counter.id}
                          className="flex cursor-pointer items-center gap-4 rounded-lg border border-border/60 bg-card/60 p-4 hover:border-primary"
                        >
                          <RadioGroupItem id={counter.id} value={counter.id} />
                          <div>
                            <p className="font-medium">{counter.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Token delivery in under 2 minutes with live screen updates.
                            </p>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Payment method
                </h3>
                <Controller
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="grid gap-3">
                      <Label
                        htmlFor="upi"
                        className="flex cursor-pointer items-center gap-4 rounded-lg border border-border/60 bg-card/60 p-4 hover:border-primary"
                      >
                        <RadioGroupItem id="upi" value="upi" />
                        <div>
                          <p className="flex items-center gap-2 font-medium">
                            <QrCode className="h-4 w-4 text-primary" /> UPI / QR (Recommended)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Instant payment with digital receipt and order confirmation.
                          </p>
                        </div>
                      </Label>
                      <Label
                        htmlFor="card"
                        className="flex cursor-pointer items-center gap-4 rounded-lg border border-border/60 bg-card/60 p-4 hover:border-primary"
                      >
                        <RadioGroupItem id="card" value="card" />
                        <div>
                          <p className="flex items-center gap-2 font-medium">
                            <Banknote className="h-4 w-4 text-primary" /> Campus card via POS
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Pay at counter with your campus card or cashless wallet.
                          </p>
                        </div>
                      </Label>
                    </RadioGroup>
                  )}
                />
              </div>

              <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Have a coupon?</h3>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Controller
                    control={form.control}
                    name="couponCode"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="Enter coupon code"
                        className="sm:flex-1"
                        onBlur={() => handleApplyCoupon(field.value)}
                      />
                    )}
                  />
                  <Button type="button" variant="outline" onClick={() => handleApplyCoupon(form.getValues('couponCode'))}>
                    Apply
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">FIRST10, CHAITIME and HEALTHY are active today.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/40 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span>Total items</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Service charge (₹2 x items)</span>
                <span>₹{totals.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>GST (5%)</span>
                <span>₹{totals.gst.toFixed(2)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon savings</span>
                  <span>-₹{totals.discount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Amount payable</span>
                <span>₹{totals.total.toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                disabled={isPlacingOrder || items.length === 0}
                onClick={form.handleSubmit(handlePlaceOrder)}
              >
                {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Pay & place order
              </Button>
              <p className="text-xs text-muted-foreground">
                On payment, your order will be marked as Paid and pushed to the kitchen queue instantly.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>

      <TokenModal
        open={tokenModalOpen}
        onOpenChange={(open) => {
          setTokenModalOpen(open);
          if (!open) {
            router.replace('/track-order');
          }
        }}
        tokenNumber={tokenNumber}
        qrCode={tokenQr}
      />
    </>
  );
}
