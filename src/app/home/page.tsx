'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter, Sparkles, UtensilsCrossed } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { AppShell } from '@/components/canteen/layout/app-shell';
import { MenuCard, MenuItemDto } from '@/components/canteen/menu/menu-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

const categoryOptions = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages'];

interface OfferBanner {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  color: string;
}

const offerBanners: OfferBanner[] = [
  {
    id: 'first10',
    title: 'FIRST10',
    subtitle: 'Flat 10% off on your first digital order',
    code: 'FIRST10',
    color: 'from-orange-500 via-amber-500 to-orange-600',
  },
  {
    id: 'chai-time',
    title: 'Chai Time Combo',
    subtitle: '₹20 off on chai + samosa combo between 4-6 PM',
    code: 'CHAITIME',
    color: 'from-emerald-500 via-teal-500 to-emerald-600',
  },
  {
    id: 'healthy-start',
    title: 'Healthy Start',
    subtitle: 'Free fruit bowl on orders above ₹150 before 10 AM',
    code: 'HEALTHY',
    color: 'from-sky-500 via-blue-500 to-sky-600',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItemDto[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showVegOnly, setShowVegOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/menu');
        setMenuItems(response.data.items || []);
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Unable to load menu', description: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [toast]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      try {
        const response = await apiClient.get('/users/favorites');
        const favIds = response.data.favorites?.map((fav: { _id: string }) => fav._id) || [];
        setFavorites(new Set(favIds));
      } catch (error) {
        // ignore
      }
    };

    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (menuItemId: string) => {
    if (!user) {
      toast({ title: 'Login required', description: 'Sign in to save favourites.' });
      return;
    }

    try {
      const response = await apiClient.post('/users/favorites', { menuItemId });
      const newFavorites = new Set(response.data.favorites.map((fav: string) => fav));
      setFavorites(newFavorites);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Could not update favourites',
        description: error?.response?.data?.message || 'Please try again later.',
      });
    }
  };

  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => (selectedCategory === 'All' ? true : item.category === selectedCategory))
      .filter((item) => (showVegOnly ? item.type === 'Veg' : true))
      .filter((item) =>
        searchTerm
          ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase())
          : true,
      );
  }, [menuItems, selectedCategory, showVegOnly, searchTerm]);

  return (
    <AppShell hideHeader={!user}>
      {!user && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-primary">Ready to order?</p>
              <h2 className="font-headline text-2xl">Sign in to unlock the complete canteen experience.</h2>
            </div>
            <Button asChild>
              <a href="/login">Sign in</a>
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="space-y-3 pb-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}!</p>
            <h1 className="font-headline text-3xl md:text-4xl">Discover today&apos;s specials</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showVegOnly ? 'default' : 'outline'}
              className="flex items-center gap-2"
              onClick={() => setShowVegOnly((prev) => !prev)}
            >
              <Filter className="h-4 w-4" /> Veg only
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={() => setSearchTerm('')}>
              Clear filters
            </Button>
          </div>
        </div>
        <p className="max-w-2xl text-muted-foreground">
          Live billing with GST & service charge, instant tokens and confetti-popping checkout—all powered by our
          MERN stack backend.
        </p>
      </section>

      <section className="grid gap-4 pb-8 md:grid-cols-3">
        {offerBanners.map((offer) => (
          <Card key={offer.id} className={`border-none bg-gradient-to-r text-white shadow-lg ${offer.color}`}>
            <CardContent className="space-y-2 p-6">
              <Badge variant="secondary" className="bg-white/20 text-xs text-white">
                <Sparkles className="mr-1 inline h-3 w-3" /> Limited Offer
              </Badge>
              <h3 className="text-2xl font-bold">{offer.title}</h3>
              <p className="text-sm text-white/85">{offer.subtitle}</p>
              <div className="rounded-full bg-black/20 px-3 py-1 text-xs uppercase tracking-wider">
                Use code {offer.code}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <Input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search dosas, biryanis, sandwiches..."
        />
        <div className="flex gap-2 overflow-x-auto">
          {categoryOptions.map((category) => (
            <Button
              key={category}
              variant={category === selectedCategory ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      <section>
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
            <UtensilsCrossed className="mr-2 h-5 w-5 animate-spin" />
            Loading today&apos;s menu...
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="border-dashed border-primary/30">
            <CardContent className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
              <UtensilsCrossed className="h-10 w-10 text-primary" />
              <p className="text-lg font-medium">No items match your filters.</p>
              <p className="text-sm text-muted-foreground">Try changing categories or search terms.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <MenuCard
                key={item._id}
                item={item}
                isFavorite={favorites.has(item._id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
