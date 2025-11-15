"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';

export const CartDrawer = () => {
  const router = useRouter();
  const { items, totals, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();

  const itemCount = useMemo(() => items.reduce((acc, item) => acc + item.qty, 0), [items]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -right-2 -top-2 h-5 min-w-[20px] rounded-full px-1 text-[11px]">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-6 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-left text-xl">
            <ShoppingBag className="h-5 w-5 text-primary" /> Your Cart
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto">
          {items.length === 0 && (
            <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center text-sm text-muted-foreground">
              Your cart is empty. Explore the menu and add your favourites.
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-lg border border-border/60 p-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-md">
                <Image
                  src={
                    item.imageUrl ||
                    `https://source.unsplash.com/random/200x200/?${encodeURIComponent(item.name)}&food`
                  }
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, Math.max(item.qty - 1, 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.qty + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-sm font-semibold">₹{(item.price * item.qty).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/40 p-4 text-sm">
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
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>Total payable</span>
            <span>₹{totals.total.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              clearCart();
              toast({ title: 'Cart cleared' });
            }}
            disabled={items.length === 0}
          >
            Clear
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              if (items.length === 0) {
                toast({ variant: 'destructive', title: 'No items in cart', description: 'Add items before checkout.' });
                return;
              }
              router.push('/checkout');
            }}
          >
            Proceed to checkout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
