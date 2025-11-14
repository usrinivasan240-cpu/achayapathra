'use client';

import * as React from 'react';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/providers/cart-provider';
import { useAppState } from '@/providers/app-state-provider';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const {
    items,
    increment,
    decrement,
    setItemNotes,
    removeItem,
    clearCart,
    couponCode,
    setCouponCode,
    totals,
  } = useCart();
  const { state, validateCoupon } = useAppState();
  const { toast } = useToast();

  const [couponInput, setCouponInput] = React.useState(couponCode ?? '');

  const handleCouponApply = () => {
    const coupon = validateCoupon(couponInput);
    if (!coupon) {
      toast({
        title: 'Coupon not valid',
        description: 'Check the code and ensure the minimum order value is reached.',
        variant: 'destructive',
      });
      return;
    }
    setCouponCode(coupon.code);
    toast({
      title: `Coupon ${coupon.code} applied`,
      description: coupon.description,
    });
  };

  const handleRemoveCoupon = () => {
    setCouponCode(null);
    setCouponInput('');
  };

  return (
    <>
      <Header title="Your Cart" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        {items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <ShoppingCart className="h-10 w-10 text-slate-400" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-slate-800">Your cart is empty</p>
                <p className="text-sm text-slate-500">
                  Explore menu categories to add freshly prepared dishes.
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard">Browse menu</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="border-slate-200">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Review items</CardTitle>
                  <CardDescription>{items.length} dishes selected</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  Clear cart
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => {
                  const menuItem = state.menuItems.find((entry) => entry.id === item.menuItemId);
                  if (!menuItem) return null;
                  return (
                    <div
                      key={item.menuItemId}
                      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[200px_1fr]"
                    >
                      <div className="space-y-3">
                        <p className="text-base font-semibold text-slate-800">{menuItem.name}</p>
                        <p className="text-sm text-slate-500">₹{menuItem.price} • {menuItem.foodType}</p>
                        <Badge variant="outline" className="text-xs uppercase tracking-wide">
                          Counter {menuItem.counterId.replace(/-/g, ' ')}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-slate-200">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => decrement(item.menuItemId)}
                              disabled={item.qty <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-4 text-sm font-semibold">{item.qty}</span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => increment(item.menuItemId)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500">Subtotal</p>
                            <p className="font-semibold text-slate-800">
                              ₹{(menuItem.price * item.qty).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Notes for kitchen
                          </label>
                          <Textarea
                            value={item.notes ?? ''}
                            onChange={(event) => setItemNotes(item.menuItemId, event.target.value)}
                            placeholder="Add preparation preferences or allergy information."
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:text-rose-700"
                            onClick={() => removeItem(item.menuItemId)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Apply coupon</CardTitle>
                  <CardDescription>
                    Use campus-exclusive promo codes for instant savings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={couponInput}
                      onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="uppercase"
                    />
                    <Button onClick={handleCouponApply} disabled={!couponInput.trim()}>
                      Apply
                    </Button>
                  </div>
                  {couponCode && (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                      <span>Coupon {couponCode} applied</span>
                      <button onClick={handleRemoveCoupon} className="font-semibold">
                        Remove
                      </button>
                    </div>
                  )}
                  <div className="space-y-2 text-xs text-slate-500">
                    <p className="font-semibold text-slate-600">Suggested coupons</p>
                    <div className="flex flex-wrap gap-2">
                      {state.coupons.map((coupon) => (
                        <button
                          key={coupon.code}
                          type="button"
                          onClick={() => {
                            setCouponInput(coupon.code);
                            setCouponCode(coupon.code);
                          }}
                          className="rounded-full border border-dashed border-slate-300 px-3 py-1 uppercase tracking-wide text-slate-600"
                        >
                          {coupon.code}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Bill summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Item total</span>
                    <span>₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (5%)</span>
                    <span>₹{totals.gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
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
                    <span>To pay</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                  <Button asChild className="mt-4 w-full" disabled={items.length === 0}>
                    <Link href="/checkout">Proceed to checkout</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
