
'use client';

import * as React from 'react';
import { Moon, Sun, ALargeSmall, Loader2, Palette } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const themeOptions = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright, neutral interface',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Low-light friendly contrast',
    icon: Moon,
  },
  {
    value: 'violet',
    label: 'Violet',
    description: 'Vibrant violet accents',
    icon: Palette,
  },
] as const;

type ThemeOption = (typeof themeOptions)[number]['value'];

export default function SettingsPage() {
  const [theme, setTheme] = React.useState<ThemeOption>('light');
  const [fontSize, setFontSize] = React.useState('medium');
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme && themeOptions.some((option) => option.value === storedTheme)) {
      setTheme(storedTheme as ThemeOption);
    }
    const storedFontSize = localStorage.getItem('fontSize');
    if (storedFontSize && ['small', 'medium', 'large'].includes(storedFontSize)) {
      setFontSize(storedFontSize);
    }
  }, []);

  React.useEffect(() => {
    if (isMounted) {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark', 'violet');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, isMounted]);

  React.useEffect(() => {
    if (isMounted) {
      document.documentElement.style.fontSize =
        fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px';
      localStorage.setItem('fontSize', fontSize);
    }
  }, [fontSize, isMounted]);

  const activeTheme =
    themeOptions.find((option) => option.value === theme) ?? themeOptions[0];
  const ThemeIcon = activeTheme.icon;

  if (!isMounted) {
    return (
        <>
            <Header title="Settings" />
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        </>
    );
  }

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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Label
                htmlFor="theme-select"
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <ThemeIcon className="h-5 w-5" />
                </div>
                <div>
                  <p>Theme</p>
                  <p className="text-sm text-muted-foreground">
                    {activeTheme.description}
                  </p>
                </div>
              </Label>
              <div className="w-full sm:w-[220px]">
                <Select
                  value={theme}
                  onValueChange={(value) => {
                    const nextTheme = themeOptions.find(
                      (option) => option.value === value
                    );
                    if (nextTheme) {
                      setTheme(nextTheme.value);
                    }
                  }}
                >
                  <SelectTrigger id="theme-select">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
                <Label className="flex items-center gap-3">
                    <div className='w-8 h-8 flex items-center justify-center bg-muted rounded-full'>
                        <ALargeSmall className="h-5 w-5" />
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
              <Switch id="task-reminders" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
