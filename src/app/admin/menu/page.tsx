'use client';

import * as React from 'react';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppState } from '@/providers/app-state-provider';
import { MenuCategory, FoodType, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash } from 'lucide-react';

const categories: MenuCategory[] = ['Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Combos', 'Desserts'];
const foodTypeOptions: FoodType[] = ['Veg', 'Non-Veg'];

export default function AdminMenuPage() {
  const { state, addMenuItem, updateMenuItem, toggleMenuItemAvailability, deleteMenuItem } = useAppState();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading } = useDoc<UserProfile>(userDocRef);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const canteen = React.useMemo(() => state.canteens.find((entry) => entry.id === profile?.canteenId), [state.canteens, profile?.canteenId]);

  const menuItems = React.useMemo(() => {
    if (!profile?.canteenId) return [];
    return state.menuItems.filter((item) => item.canteenId === profile.canteenId);
  }, [state.menuItems, profile?.canteenId]);

  const [formState, setFormState] = React.useState({
    name: '',
    price: 80,
    category: categories[0],
    foodType: foodTypeOptions[0],
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    ingredients: '' as string,
    counterId: '',
  });

  React.useEffect(() => {
    if (canteen && !formState.counterId) {
      setFormState((prev) => ({ ...prev, counterId: canteen.counters[0]?.id ?? '' }));
    }
  }, [canteen, formState.counterId]);

  const handleCreate = () => {
    if (!profile?.canteenId || !formState.counterId) {
      toast({
        title: 'Select counter',
        description: 'Assign the new menu item to a specific counter.',
        variant: 'destructive',
      });
      return;
    }
    const menuItem = addMenuItem(
      {
        canteenId: profile.canteenId,
        counterId: formState.counterId,
        name: formState.name,
        price: Number(formState.price),
        category: formState.category,
        foodType: formState.foodType,
        description: formState.description,
        ingredients: formState.ingredients.split(',').map((item) => item.trim()).filter(Boolean),
        imageUrl: formState.imageUrl,
      },
      {
        id: user?.uid ?? 'admin',
        name: profile.displayName,
        role: 'admin',
      }
    );
    toast({ title: `${menuItem.name} added to the menu.` });
    setFormState({
      name: '',
      price: 80,
      category: categories[0],
      foodType: foodTypeOptions[0],
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      ingredients: '',
      counterId: canteen?.counters[0]?.id ?? '',
    });
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Admin access required.
      </div>
    );
  }

  return (
    <>
      <Header title="Manage menu" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{canteen?.name ?? 'Canteen menu'}</h2>
            <p className="text-sm text-slate-500">
              Update availability, pricing, and descriptions instantly across counters.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add a new menu item</DialogTitle>
                <DialogDescription>
                  Fill in item information. Ratings will update automatically from student reviews.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
                  <Input
                    value={formState.name}
                    onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price (₹)</label>
                  <Input
                    type="number"
                    value={formState.price}
                    onChange={(event) => setFormState((prev) => ({ ...prev, price: Number(event.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
                  <Select
                    value={formState.category}
                    onValueChange={(value) => setFormState((prev) => ({ ...prev, category: value as MenuCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Food type</label>
                  <Select
                    value={formState.foodType}
                    onValueChange={(value) => setFormState((prev) => ({ ...prev, foodType: value as FoodType }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Food type" />
                    </SelectTrigger>
                    <SelectContent>
                      {foodTypeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Counter</label>
                  <Select
                    value={formState.counterId}
                    onValueChange={(value) => setFormState((prev) => ({ ...prev, counterId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select counter" />
                    </SelectTrigger>
                    <SelectContent>
                      {canteen?.counters.map((counter) => (
                        <SelectItem key={counter.id} value={counter.id}>
                          {counter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Image URL</label>
                  <Input
                    value={formState.imageUrl}
                    onChange={(event) => setFormState((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ingredients</label>
                  <Input
                    placeholder="Comma separated"
                    value={formState.ingredients}
                    onChange={(event) => setFormState((prev) => ({ ...prev, ingredients: event.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</label>
                  <Textarea
                    value={formState.description}
                    onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>Save item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {menuItems.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-slate-500">
                Add your first menu item to get started.
              </CardContent>
            </Card>
          ) : (
            menuItems.map((item) => (
              <Card key={item.id} className="border-slate-200">
                <CardContent className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-800">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      ₹{item.price} • {item.category} • {item.foodType}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <Badge variant="outline">{item.counterId.replace(/-/g, ' ')}</Badge>
                      <span>Rating {item.rating.toFixed(1)} ({item.ratingCount})</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wide text-slate-500">Available</span>
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={(checked) =>
                          toggleMenuItemAvailability(item.id, checked, {
                            id: user?.uid ?? 'admin',
                            name: profile.displayName,
                            role: 'admin',
                          })
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => {
                        deleteMenuItem(item.id, {
                          id: user?.uid ?? 'admin',
                          name: profile.displayName,
                          role: 'admin',
                        });
                        toast({ title: `${item.name} removed from menu.` });
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </>
  );
}
