'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FoodCard } from '@/components/FoodCard';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  isVeg: boolean;
  image?: string;
  rating?: number;
  isAvailable: boolean;
}

const CATEGORIES = ['Breakfast', 'Lunch', 'Snacks', 'Beverages'];

export default function CanteenHomePage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { addItem, totalQuantity } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Breakfast');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    fetchMenuItems();
  }, [user, router]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/menu?category=${selectedCategory}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch menu items');

      const data = await response.json();
      setMenuItems(data.items || []);
      setFilteredItems(data.items || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchMenuItems();
  };

  const handleAddToCart = (item: any) => {
    addItem(item);
    toast.success(`${item.name} added to cart!`);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-orange-600">🍽️ Canteen</h1>
            <p className="text-sm text-gray-600">Welcome, {user.name}!</p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/canteen/orders">
              <Button variant="outline" className="relative">
                View Orders
              </Button>
            </Link>

            <Link href="/canteen/cart">
              <Button className="relative bg-orange-500 hover:bg-orange-600">
                <ShoppingCart className="w-5 h-5" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </Button>
            </Link>

            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Select Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              onClick={() => handleCategoryChange(category)}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={`h-16 text-lg font-semibold ${
                selectedCategory === category
                  ? 'bg-orange-500 hover:bg-orange-600'
                  : ''
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">{selectedCategory}</h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading menu items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600 text-lg">
                  No items available in {selectedCategory}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <FoodCard
                  key={item._id}
                  id={item._id}
                  name={item.name}
                  price={item.price}
                  description={item.description}
                  image={item.image}
                  isVeg={item.isVeg}
                  rating={item.rating}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
