'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Notification } from '@/lib/types';
import { mockNotifications } from '@/lib/data';
import {
  Bell,
  Gift,
  Zap,
  Truck,
  AlertTriangle,
  Award,
  Settings,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  FileText,
  Clock,
  X,
} from 'lucide-react';

type NotificationType = Notification['type'];

interface NotificationPreferences {
  donation: boolean;
  match: boolean;
  delivery: boolean;
  emergency: boolean;
  achievement: boolean;
  system: boolean;
  certificate: boolean;
}

const NOTIFICATION_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  donation: { icon: Gift, color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-950', label: 'Donation' },
  match: { icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-950', label: 'Match' },
  delivery: { icon: Truck, color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-950', label: 'Delivery' },
  emergency: { icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-950', label: 'Emergency' },
  achievement: { icon: Award, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-950', label: 'Achievement' },
  system: { icon: Settings, color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800', label: 'System' },
  certificate: { icon: FileText, color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-950', label: 'Certificate' },
};

const FILTER_TABS: { value: string; label: string; type?: NotificationType }[] = [
  { value: 'all', label: 'All' },
  { value: 'donations', label: 'Donations', type: 'donation' },
  { value: 'matches', label: 'Matches', type: 'match' },
  { value: 'deliveries', label: 'Deliveries', type: 'delivery' },
  { value: 'emergencies', label: 'Emergencies', type: 'emergency' },
  { value: 'achievements', label: 'Achievements', type: 'achievement' },
];

function NotificationItem({
  notification,
  onToggleRead,
  onDelete,
}: {
  notification: Notification;
  onToggleRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = NOTIFICATION_CONFIG[notification.type];
  const IconComponent = config.icon;

  const timeAgo = React.useMemo(() => {
    const now = Date.now();
    const created = notification.createdAt.toMillis();
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }, [notification.createdAt]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border transition-all hover:shadow-md ${
        notification.read
          ? 'bg-background border-border opacity-75'
          : 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
      }`}
    >
      <div className={`flex-shrink-0 p-2 rounded-lg ${config.bgColor}`}>
        <IconComponent className={`h-5 w-5 ${config.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={`text-sm font-semibold leading-tight ${
                notification.read ? 'text-muted-foreground' : 'text-foreground'
              }`}
            >
              {notification.title}
            </p>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-orange-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onToggleRead(notification.id)}
              title={notification.read ? 'Mark as unread' : 'Mark as read'}
            >
              {notification.read ? (
                <Check className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5 text-orange-500" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(notification.id)}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <p
          className={`text-xs mt-1 leading-relaxed ${
            notification.read ? 'text-muted-foreground' : 'text-foreground/80'
          }`}
        >
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 uppercase font-bold tracking-wider">
            {config.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {timeAgo}
          </span>
        </div>
      </div>
    </div>
  );
}

function PreferencesPanel({
  preferences,
  onToggle,
}: {
  preferences: NotificationPreferences;
  onToggle: (key: keyof NotificationPreferences) => void;
}) {
  const prefItems: { key: keyof NotificationPreferences; label: string; description: string; icon: React.ElementType; color: string }[] = [
    { key: 'donation', label: 'Donation Alerts', description: 'Get notified about new donations and status updates', icon: Gift, color: 'text-orange-500' },
    { key: 'match', label: 'Match Notifications', description: 'AI-powered match confirmations and updates', icon: Zap, color: 'text-blue-500' },
    { key: 'delivery', label: 'Delivery Updates', description: 'Track your deliveries in real-time', icon: Truck, color: 'text-green-500' },
    { key: 'emergency', label: 'Emergency Alerts', description: 'Critical alerts for disaster relief coordination', icon: AlertTriangle, color: 'text-red-500' },
    { key: 'achievement', label: 'Achievements', description: 'Badge unlocks, milestones, and gamification rewards', icon: Award, color: 'text-yellow-500' },
    { key: 'system', label: 'System Notices', description: 'Platform updates and maintenance schedules', icon: Settings, color: 'text-gray-500' },
    { key: 'certificate', label: 'Certificates', description: 'Certificate generation and verification alerts', icon: FileText, color: 'text-purple-500' },
  ];

  return (
    <Card className="shadow-sm border-none bg-card/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <Settings className="h-5 w-5 text-orange-500" />
          Notification Preferences
        </CardTitle>
        <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          Choose which notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {prefItems.map((item) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.key}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted/50`}>
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Switch
                  checked={preferences[item.key]}
                  onCheckedChange={() => onToggle(item.key)}
                />
              </div>
              <Separator />
            </React.Fragment>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = React.useState('all');
  const [showPreferences, setShowPreferences] = React.useState(false);
  const [preferences, setPreferences] = React.useState<NotificationPreferences>({
    donation: true,
    match: true,
    delivery: true,
    emergency: true,
    achievement: true,
    system: false,
    certificate: true,
  });

  const unreadCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    FILTER_TABS.forEach((tab) => {
      counts[tab.value] = 0;
    });

    notifications.forEach((n) => {
      if (!n.read) {
        counts.all++;
        const tab = FILTER_TABS.find((t) => t.type === n.type);
        if (tab) {
          counts[tab.value]++;
        }
      }
    });

    return counts;
  }, [notifications]);

  const filteredNotifications = React.useMemo(() => {
    if (activeTab === 'all') return notifications;
    const tab = FILTER_TABS.find((t) => t.value === activeTab);
    if (!tab?.type) return notifications;
    return notifications.filter((n) => n.type === tab.type);
  }, [notifications, activeTab]);

  const totalUnread = unreadCounts.all;

  const handleToggleRead = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  }, []);

  const handleDelete = React.useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleMarkAllRead = React.useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const handleTogglePreference = React.useCallback((key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <>
      <Header title="Notifications" />

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 lg:grid-cols-6 h-auto p-1 bg-muted/50 rounded-xl overflow-x-auto whitespace-nowrap gap-0.5">
            {FILTER_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-[10px] md:text-xs font-bold uppercase py-2.5 relative"
              >
                {tab.label}
                {unreadCounts[tab.value] > 0 && (
                  <Badge className="ml-1.5 bg-orange-500 text-white text-[8px] px-1 py-0 h-4 min-w-[16px] justify-center font-black">
                    {unreadCounts[tab.value]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {showPreferences ? (
              <PreferencesPanel preferences={preferences} onToggle={handleTogglePreference} />
            ) : (
              <Card className="shadow-sm border-none bg-card/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-headline flex items-center gap-2">
                        <Bell className="h-5 w-5 text-orange-500" />
                        {activeTab === 'all' ? 'All Notifications' : FILTER_TABS.find((t) => t.value === activeTab)?.label}
                      </CardTitle>
                      <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground mt-1">
                        {filteredNotifications.length} notifications{' '}
                        {unreadCounts[activeTab] > 0 && (
                          <span className="text-orange-500">
                            ({unreadCounts[activeTab]} unread)
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <Filter className="h-3 w-3 mr-1" />
                      {activeTab === 'all' ? 'All Types' : NOTIFICATION_CONFIG[FILTER_TABS.find((t) => t.value === activeTab)?.type || 'donation']?.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <Bell className="h-12 w-12 mb-4 opacity-30" />
                      <p className="text-sm font-medium">No notifications in this category</p>
                      <p className="text-xs mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onToggleRead={handleToggleRead}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {!showPreferences && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(NOTIFICATION_CONFIG).map(([type, config]) => {
              const Icon = config.icon;
              const typeCount = notifications.filter((n) => n.type === type).length;
              const typeUnread = unreadCounts[type] || 0;
              return (
                <Card
                  key={type}
                  className={`shadow-sm border-none cursor-pointer transition-all hover:shadow-md ${
                    activeTab === FILTER_TABS.find((t) => t.type === type)?.value
                      ? 'bg-orange-50 dark:bg-orange-950/30 ring-2 ring-orange-500/30'
                      : 'bg-card/50'
                  }`}
                  onClick={() => {
                    const tab = FILTER_TABS.find((t) => t.type === type);
                    if (tab) setActiveTab(tab.value);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      {typeUnread > 0 && (
                        <Badge className="bg-orange-500 text-white text-[9px] px-1.5 py-0 h-4 font-black">
                          {typeUnread}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-bold mt-3 uppercase tracking-wider text-muted-foreground">
                      {config.label}
                    </p>
                    <p className="text-lg font-black mt-0.5">{typeCount}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
