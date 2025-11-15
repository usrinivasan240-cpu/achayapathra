'use client';

import Link from 'next/link';
import { AppShell } from '@/components/canteen/layout/app-shell';
import { useCart } from '@/contexts/cart-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CartDrawer } from '@/components/canteen/cart/cart-drawer';

export default function CartPage() {
  const { items, totals, clearCart } = useCart();

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl">Your cart</h1>
          <p className="text-muted-foreground">Review your selections and head to checkout when you&apos;re ready.</p>
        </div>
        <CartDrawer />
      </div>

      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle className="text-2xl">Selected items</CardTitle>
          <CardDescription>Service charge of ₹2 per item and 5% GST will be applied automatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-muted-foreground/40 p-6 text-center text-muted-foreground">
                Your cart is empty. Browse the{' '}
                <Link href="/home" className="font-medium text-primary hover:underline">
                  menu
                </Link>{' '}
                to add dishes.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/60 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.qty} • ₹{item.price.toFixed(2)} each
                    </p>
                  </div>
                  <span className="text-base font-semibold">₹{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Service charge</span>
              <span>₹{totals.serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST (5%)</span>
              <span>₹{totals.gst.toFixed(2)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-₹{totals.discount.toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-semibold">
              <span>Amount payable</span>
              <span>₹{totals.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="flex-1" onClick={clearCart} disabled={items.length === 0}>
              Clear cart
            </Button>
            <Button asChild className="flex-1" disabled={items.length === 0}>
              <Link href="/checkout">Proceed to checkout</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
