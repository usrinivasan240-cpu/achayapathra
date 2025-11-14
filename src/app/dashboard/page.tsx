'use client';

import * as React from 'react';
import Image from 'next/image';
import { Loader2, Plus, ShoppingCart, Star } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/header';
import { useAppState } from '@/providers/app-state-provider';
import { useCart } from '@/providers/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { MenuCategory, MenuItem, UserProfile } from '@/lib/types';

const categories: Array<MenuCategory | 'All'> = [
  'All',
  'Breakfast',
  'Lunch',
  'Snacks',
  'Beverages',
  'Combos',
  'Desserts',
];

function MenuItemCard({
  item,
  onAdd,
  onToggleFavorite,
  isFavorite,
}: {
  item: MenuItem;
  onAdd: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}) {
  return (
    <Card className="overflow-hidden border-slate-200/60 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-40 w-full">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
        />
        <button
          type="button"
          onClick={onToggleFavorite}
          className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-amber-500 shadow"
        >
          <Star className={`h-5 w-5 ${isFavorite ? 'fill-amber-500' : ''}`} />
          <span className="sr-only">Toggle favourite</span>
        </button>
        {!item.isAvailable && (
          <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="line-clamp-1 text-lg">{item.name}</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          ₹{item.price} • {item.foodType}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm text-slate-600">{item.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4" />
            {item.rating.toFixed(1)}
            <span className="text-slate-400">({item.ratingCount})</span>
          </span>
          <span className="text-xs uppercase tracking-wide text-slate-400">
            #{item.counterId}
          </span>
        </div>
        <Button className="w-full" onClick={onAdd} disabled={!item.isAvailable}>
          <Plus className="mr-2 h-4 w-4" /> Add to cart
        </Button>
      </CardContent>
    </Card>
  );
}

export default function StudentDashboardPage() {
  const { state, toggleFavorite } = useAppState();
  const { addItem, totals } = useCart();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile } = useDoc<UserProfile>(userDocRef);

  const [selectedCategory, setSelectedCategory] = React.useState<MenuCategory | 'All'>('All');

  const favoriteIds = React.useMemo(() => {
    if (!user) return [] as string[];
    return state.favoriteMap[user.uid] ?? [];
  }, [state.favoriteMap, user]);

  const filteredMenuItems = React.useMemo(() => {
    const available = state.menuItems.filter((item) => {
      if (!profile?.canteenId) return item.isAvailable;
      return item.canteenId === profile.canteenId && item.isAvailable;
    });
    if (selectedCategory === 'All') return available;
    return available.filter((item) => item.category === selectedCategory);
  }, [state.menuItems, selectedCategory, profile?.canteenId]);

  const activeOrders = React.useMemo(() => {
    if (!user) return 0;
    return state.orders.filter(
      (order) =>
        order.userId === user.uid && ['Pending', 'Cooking', 'Ready'].includes(order.status)
    ).length;
  }, [state.orders, user]);

  const completedOrders = React.useMemo(() => {
    if (!user) return 0;
    return state.orders.filter(
      (order) =>
        order.userId === user.uid && ['Delivered'].includes(order.status)
    ).length;
  }, [state.orders, user]);

  const handleAddToCart = React.useCallback(
    (item: MenuItem) => {
      addItem({ menuItemId: item.id, qty: 1 });
      toast({
        title: `${item.name} added to cart`,
        description: 'Review your cart before checkout to apply coupons.',
      });
    },
    [addItem, toast]
  );

  const handleToggleFavorite = React.useCallback(
    (menuItemId: string) => {
      if (!user) return;
      toggleFavorite({ userId: user.uid, menuItemId });
    },
    [toggleFavorite, user]
  );

  if (isUserLoading && !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header title="Canteen Home" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Loyalty Points</CardDescription>
              <CardTitle className="text-3xl text-primary">
                {profile?.loyaltyPoints ?? 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Earn bonus points on Wellness Wednesday combos.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Orders</CardDescription>
              <CardTitle className="text-3xl">{activeOrders}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Track cooking, ready, and delivery status live.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">{completedOrders}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                Rate dishes to help friends pick quicker.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cart Summary</CardDescription>
              <CardTitle className="text-3xl">₹{totals.total.toFixed(2)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <ShoppingCart className="h-4 w-4" />
                {totals.totalQuantity} items awaiting checkout
              </div>
            </CardContent>
          </Card>
        </section>

        {state.banners.length > 0 && (
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {state.banners.map((banner) => (
              <div
                key={banner.id}
                className={`relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br ${banner.highlightColor ?? 'from-emerald-500 via-emerald-400 to-emerald-500'} p-6 text-white shadow-lg`}
              >
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-widest text-white/80">
                    Limited time offer
                  </span>
                  <h3 className="text-xl font-semibold">{banner.title}</h3>
                  <p className="text-sm text-white/90">{banner.description}</p>
                  {banner.couponCode && (
                    <Badge className="bg-white/20 text-white">
                      Use code {banner.couponCode}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Browse Menu</h2>
              <p className="text-sm text-slate-500">
                {profile?.canteenId
                  ? `Serving from ${profile.canteenId.replace(/-/g, ' ')}`
                  : 'Select from the most loved dishes across campus counters.'}
              </p>
            </div>
          </div>

          <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as MenuCategory | 'All')}>
            <TabsList className="flex flex-wrap gap-2 bg-white">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="rounded-full px-4 py-1 capitalize">
                  {category.toLowerCase()}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={selectedCategory} className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredMenuItems.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500">
                    <p className="text-lg font-semibold">No dishes available right now</p>
                    <p className="mt-2 text-sm">Check back in a bit — counters refresh menus throughout the day.</p>
                  </div>
                ) : (
                  filteredMenuItems.map((menuItem) => (
                    <MenuItemCard
                      key={menuItem.id}
                      item={menuItem}
                      isFavorite={favoriteIds.includes(menuItem.id)}
                      onAdd={() => handleAddToCart(menuItem)}
                      onToggleFavorite={() => handleToggleFavorite(menuItem.id)}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </>
  );
}
