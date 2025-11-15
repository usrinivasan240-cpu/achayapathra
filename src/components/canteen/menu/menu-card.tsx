"use client";

import Image from 'next/image';
import { Heart, Leaf, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';

export interface MenuItemDto {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  type?: 'Veg' | 'Non-Veg';
  price: number;
  imageUrl?: string;
  rating?: number;
  isAvailable?: boolean;
}

interface MenuCardProps {
  item: MenuItemDto;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

export const MenuCard = ({ item, onToggleFavorite, isFavorite }: MenuCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!item.isAvailable) {
      toast({ variant: 'destructive', title: 'Currently unavailable', description: 'Please choose another item.' });
      return;
    }

    addToCart({
      id: item._id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      category: item.category,
      type: item.type,
    });

    toast({ title: 'Added to cart', description: `${item.name} has been added to your cart.` });
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden border border-border/40 bg-card/60 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg">
      <div className="relative h-40 w-full">
        <Image
          src={
            item.imageUrl ||
            `https://source.unsplash.com/random/500x400/?food,${encodeURIComponent(item.category || 'meal')}`
          }
          alt={item.name}
          fill
          className={`object-cover transition-all group-hover:scale-105 ${item.isAvailable ? '' : 'grayscale'}`}
        />
        <div className="absolute left-4 top-4 flex gap-2">
          {item.type === 'Veg' && <Badge className="flex items-center gap-1 bg-emerald-500"><Leaf className="h-3 w-3" /> Veg</Badge>}
          {!item.isAvailable && <Badge variant="destructive">Out of stock</Badge>}
        </div>
        {typeof item.rating === 'number' && (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
            <Star className="h-3 w-3 text-amber-400" /> {item.rating.toFixed(1)}
          </div>
        )}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(item._id)}
            className="absolute right-4 bottom-4 rounded-full bg-white/80 p-2 text-rose-500 shadow-md transition hover:bg-white"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="flex items-start justify-between text-lg">
          <span>{item.name}</span>
          <span className="text-base font-semibold text-primary">₹{item.price.toFixed(2)}</span>
        </CardTitle>
        {item.category && <Badge variant="outline">{item.category}</Badge>}
      </CardHeader>
      <CardContent className="flex-1 pb-0 text-sm text-muted-foreground">
        {item.description || 'Freshly prepared with the finest campus kitchen ingredients.'}
      </CardContent>
      <CardFooter className="mt-auto flex gap-2 pt-4">
        <Button className="w-full gap-2" onClick={handleAddToCart} disabled={!item.isAvailable}>
          <ShoppingCart className="h-4 w-4" /> Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
};
