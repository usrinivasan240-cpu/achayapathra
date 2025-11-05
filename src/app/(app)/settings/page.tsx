'use client';

import * as React from 'react';
import { Moon, Sun, Bell, TextSize } from 'lucide-react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const [theme, setTheme] = React.useState('light');
  const [fontSize, setFontSize] = React.useState('medium');

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  React.useEffect(() => {
    document.documentElement.style.fontSize =
      fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px';
  }, [fontSize]);


  return (
    <>
      <Header title="Settings" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme-switcher" className="flex items-center gap-3">
                <div className='w-8 h-8 flex items-center justify-center bg-muted rounded-full'>
                    {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </div>
                <div>
                    <p>Theme</p>
                    <p className='text-sm text-muted-foreground'>
                        {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                    </p>
                </div>
              </Label>
              <Switch
                id="theme-switcher"
                checked={theme === 'dark'}
                onCheckedChange={(checked) =>
                  setTheme(checked ? 'dark' : 'light')
                }
              />
            </div>
            <Separator />
            <div className="space-y-4">
                <Label className="flex items-center gap-3">
                    <div className='w-8 h-8 flex items-center justify-center bg-muted rounded-full'>
                        <TextSize className="h-5 w-5" />
                    </div>
                     <p>Font Size</p>
                </Label>
               <div className="flex gap-2 pt-2">
                <Button
                  variant={fontSize === 'small' ? 'default' : 'outline'}
                  onClick={() => setFontSize('small')}
                >
                  Small
                </Button>
                <Button
                  variant={fontSize === 'medium' ? 'default' : 'outline'}
                  onClick={() => setFontSize('medium')}
                >
                  Medium
                </Button>
                <Button
                  variant={fontSize === 'large' ? 'default' : 'outline'}
                  onClick={() => setFontSize('large')}
                >
                  Large
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle className="font-headline">Notifications</CardTitle>
            <CardDescription>
              Manage how you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="donation-updates" className="flex-1">
                <p>Donation Updates</p>
                <p className="text-sm font-normal text-muted-foreground">
                  Get notified when a new donation becomes available near you.
                </p>
              </Label>
              <Switch id="donation-updates" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="task-reminders" className="flex-1">
                <p>Task Reminders</p>
                <p className="text-sm font-normal text-muted-foreground">
                  Receive reminders for your accepted volunteer tasks.
                </p>
              </Label>
              <Switch id="task-reminders" />
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
