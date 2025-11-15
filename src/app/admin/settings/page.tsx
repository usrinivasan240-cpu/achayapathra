'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/canteen/home');
      return;
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, [user, router]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    toast.success(`Theme changed to ${newTheme}`);
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
            <h1 className="text-2xl font-bold text-blue-600">Settings</h1>
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
              <Button variant="outline" className="w-full justify-start">
                Menu Items
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full justify-start">
                Reports
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="default" className="w-full justify-start">
                Settings
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-2xl">
            {/* Theme Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <label className="text-sm font-semibold">Select Theme</label>
                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleThemeChange('light')}
                      variant={theme === 'light' ? 'default' : 'outline'}
                      className="flex-1"
                    >
                      ☀️ Light
                    </Button>
                    <Button
                      onClick={() => handleThemeChange('dark')}
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      className="flex-1"
                    >
                      🌙 Dark
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Canteen Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Canteen Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold">Canteen Name</label>
                    <Input placeholder="Enter canteen name" defaultValue="Main Canteen" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Location</label>
                    <Input placeholder="Enter location" defaultValue="Building A, Ground Floor" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Number of Counters</label>
                    <Input placeholder="Enter number of counters" type="number" defaultValue="3" />
                  </div>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Billing Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold">GST Rate (%)</label>
                    <Input placeholder="Enter GST rate" type="number" defaultValue="5" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Service Charge per Item (₹)</label>
                    <Input placeholder="Enter service charge" type="number" defaultValue="2" />
                  </div>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
