'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  isVeg: boolean;
  image?: string;
  isAvailable: boolean;
}

export default function AdminMenuPage() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Breakfast',
    isVeg: true,
    image: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/canteen/home');
      return;
    }

    fetchMenuItems();
  }, [user, token, router]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/menu', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch menu items');

      const data = await response.json();
      setItems(data.items || []);
    } catch (error: any) {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      if (!formData.name || !formData.price || !formData.category) {
        toast.error('Please fill required fields');
        return;
      }

      const response = await fetch('/api/menu/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          canteenId: 'default-canteen',
        }),
      });

      if (!response.ok) throw new Error('Failed to add menu item');

      toast.success('Menu item added successfully');
      setFormData({
        name: '',
        price: '',
        description: '',
        category: 'Breakfast',
        isVeg: true,
        image: '',
      });
      setOpenDialog(false);
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add menu item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete item');

      toast.success('Menu item deleted');
      fetchMenuItems();
    } catch (error: any) {
      toast.error('Failed to delete menu item');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Menu Items</h1>
          </div>

          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 bg-white shadow-md min-h-screen p-4">
          <nav className="space-y-2">
            <Link href="/admin/dashboard">
              <Button variant="outline" className="w-full justify-start">
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full justify-start">
                Orders
              </Button>
            </Link>
            <Link href="/admin/menu">
              <Button variant="default" className="w-full justify-start">
                Menu Items
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full justify-start">
                Reports
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start">
                Settings
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-6">
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600">
                  Add New Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Menu Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Item Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                  <select
                    className="w-full border rounded p-2"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Snacks</option>
                    <option>Beverages</option>
                  </select>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isVeg}
                      onChange={(e) =>
                        setFormData({ ...formData, isVeg: e.target.checked })
                      }
                    />
                    Vegetarian
                  </label>
                  <Button
                    onClick={handleAddItem}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    Add Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading menu items...</p>
            </div>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No menu items yet. Add your first item!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <Card key={item._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="line-clamp-2">{item.name}</span>
                      <span>{item.isVeg ? '🌱' : '🍗'}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-green-600">
                        ₹{item.price}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          item.isAvailable
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Out of Stock'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteItem(item._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
