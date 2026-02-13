'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface FoodCardProps {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  isVeg: boolean;
  rating?: number;
  onAddToCart: (item: { itemId: string; name: string; price: number; quantity: number }) => void;
}

export function FoodCard({
  id,
  name,
  price,
  description,
  image,
  isVeg,
  rating,
  onAddToCart,
}: FoodCardProps) {
  const [quantity, setQuantity] = useState(0);

  const handleAddToCart = () => {
    if (quantity > 0) {
      onAddToCart({
        itemId: id,
        name,
        price,
        quantity,
      });
      setQuantity(0);
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="relative w-full h-40 mb-2 rounded-md overflow-hidden bg-gray-100">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="bg-white px-2 py-1 rounded text-sm font-semibold">
              {isVeg ? '🌱' : '🍗'}
            </span>
          </div>
        </div>
        <CardTitle className="line-clamp-2">{name}</CardTitle>
        {rating && <CardDescription>⭐ {rating.toFixed(1)}</CardDescription>}
      </CardHeader>

      <CardContent className="flex-grow">
        {description && <p className="text-sm text-gray-600 line-clamp-2">{description}</p>}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-0">
        <div className="w-full flex items-center justify-between">
          <span className="text-lg font-bold text-green-600">₹{price}</span>
          {rating && <span className="text-xs text-gray-500">Rating: {rating.toFixed(1)}</span>}
        </div>

        {quantity === 0 ? (
          <Button
            onClick={() => setQuantity(1)}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            Add to Cart
          </Button>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuantity(Math.max(0, quantity - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="flex-1 text-center font-semibold">{quantity}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="ml-2 bg-green-500 hover:bg-green-600"
            >
              Add
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
