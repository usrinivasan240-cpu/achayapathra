'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { AppShell } from '@/components/canteen/layout/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

const menuSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.enum(['Breakfast', 'Lunch', 'Snacks', 'Beverages']),
  type: z.enum(['Veg', 'Non-Veg']),
  price: z.coerce.number().min(1),
  imageUrl: z.string().url().optional().or(z.literal('')),
  ingredients: z.string().optional(),
});

type MenuFormValues = z.infer<typeof menuSchema>;

interface AdminMenuItem {
  _id: string;
  name: string;
  category: string;
  type: 'Veg' | 'Non-Veg';
  price: number;
  isAvailable: boolean;
  imageUrl?: string;
  description?: string;
  ingredients?: string[];
}

export default function AdminItemsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/admin/login');
    } else if (!isAdmin) {
      router.replace('/home');
    }
  }, [isAdmin, loading, router, user]);

  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'Lunch',
      type: 'Veg',
      price: 60,
      imageUrl: '',
      ingredients: '',
    },
  });

  const fetchMenu = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoadingMenu(true);
      const response = await apiClient.get('/menu');
      setItems(response.data.items || []);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Unable to fetch menu', description: error.message });
    } finally {
      setLoadingMenu(false);
    }
  }, [isAdmin, toast]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchMenu();
  }, [user, isAdmin, fetchMenu]);

  const onSubmit = async (values: MenuFormValues) => {
    try {
      setSubmitting(true);
      const payload = {
        ...values,
        ingredients: values.ingredients ? values.ingredients.split(',').map((item) => item.trim()) : [],
      };
      const response = await apiClient.post('/menu/add', payload);
      setItems((prev) => [response.data.menuItem, ...prev]);
      toast({ title: 'Menu item added', description: `${values.name} is now available.` });
      form.reset({ ...form.getValues(), name: '', description: '', price: 60, imageUrl: '', ingredients: '' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Could not add item', description: error?.response?.data?.message || error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAvailability = async (id: string, nextState: boolean) => {
    try {
      await apiClient.patch(`/menu/${id}/availability`, { isAvailable: nextState });
      setItems((prev) => prev.map((item) => (item._id === id ? { ...item, isAvailable: nextState } : item)));
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Unable to update availability', description: error.message });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await apiClient.delete(`/menu/${id}`);
      setItems((prev) => prev.filter((item) => item._id !== id));
      toast({ title: 'Menu item removed' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Unable to delete item', description: error.message });
    }
  };

  if (loading || !user) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading menu...</div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          You do not have permission to manage menu items.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-headline text-3xl">Menu management</h1>
        <p className="text-muted-foreground">Add signature dishes, toggle counters and keep pricing in sync.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl">Create menu item</CardTitle>
            <CardDescription>Set availability instantly after saving.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Masala Dosa" {...form.register('name')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Crispy dosa with aloo masala" {...form.register('description')} />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={form.watch('category')} onValueChange={(value) => form.setValue('category', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Breakfast', 'Lunch', 'Snacks', 'Beverages'].map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={form.watch('type')} onValueChange={(value) => form.setValue('type', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Veg">Veg</SelectItem>
                    <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input id="price" type="number" step="1" {...form.register('price')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" placeholder="https://..." {...form.register('imageUrl')} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ingredients">Ingredients (comma separated)</Label>
                <Input id="ingredients" placeholder="Rice, Lentils, Spices" {...form.register('ingredients')} />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} <Plus className="mr-2 h-4 w-4" /> Add item
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle>Current menu</CardTitle>
            <CardDescription>Use the switch to mark an item as out of stock instantly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingMenu ? (
              <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading menu...
              </div>
            ) : items.length === 0 ? (
              <p className="text-muted-foreground">No dishes found yet. Create the first one using the form.</p>
            ) : (
              items.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card/60 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.category} • {item.type} • ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`availability-${item._id}`}
                        checked={item.isAvailable}
                        onCheckedChange={(checked) => toggleAvailability(item._id, checked)}
                      />
                      <Label htmlFor={`availability-${item._id}`} className="text-sm">
                        {item.isAvailable ? 'Available' : 'Out of stock'}
                      </Label>
                    </div>
                    <Button variant="destructive" size="icon" onClick={() => deleteItem(item._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
