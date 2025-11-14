'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock3, CookingPot, Loader2, PackageCheck, TimerIcon } from 'lucide-react';
import { useAppState } from '@/providers/app-state-provider';
import { useUser } from '@/firebase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const orderSteps: { status: string; label: string }[] = [
  { status: 'Pending', label: 'Pending' },
  { status: 'Cooking', label: 'Cooking' },
  { status: 'Ready', label: 'Ready' },
  { status: 'Delivered', label: 'Delivered' },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } & { icon: React.ComponentType<any> }> = {
  Pending: { label: 'Pending', variant: 'secondary', icon: TimerIcon },
  Cooking: { label: 'Cooking', variant: 'secondary', icon: CookingPot },
  Ready: { label: 'Ready', variant: 'default', icon: PackageCheck },
  Delivered: { label: 'Delivered', variant: 'outline', icon: PackageCheck },
  Cancelled: { label: 'Cancelled', variant: 'destructive', icon: Clock3 },
  Rejected: { label: 'Rejected', variant: 'destructive', icon: Clock3 },
};

function OrderStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.Pending;
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="inline-flex items-center gap-1">
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

function computeProgress(status: string) {
  const index = orderSteps.findIndex((step) => step.status === status);
  if (index === -1) return 0;
  return ((index + 1) / orderSteps.length) * 100;
}

export default function OrdersPage() {
  const { state } = useAppState();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const readyOrdersCache = React.useRef<Set<string>>(new Set());

  const orders = React.useMemo(() => {
    if (!user) return [];
    return state.orders.filter((order) => order.userId === user.uid);
  }, [state.orders, user]);

  const activeOrders = React.useMemo(
    () => orders.filter((order) => ['Pending', 'Cooking', 'Ready'].includes(order.status)),
    [orders]
  );

  const historyOrders = React.useMemo(
    () => orders.filter((order) => ['Delivered', 'Cancelled', 'Rejected'].includes(order.status)),
    [orders]
  );

  React.useEffect(() => {
    for (const order of activeOrders) {
      if (order.status === 'Ready' && !readyOrdersCache.current.has(order.id)) {
        readyOrdersCache.current.add(order.id);
        toast({
          title: `Order ${order.tokenNumber} is ready!`,
          description: 'Head to the counter with your QR code to collect the meal.',
        });
      }
      if (order.status !== 'Ready' && readyOrdersCache.current.has(order.id)) {
        readyOrdersCache.current.delete(order.id);
      }
    }
  }, [activeOrders, toast]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-center">
        <h2 className="text-lg font-semibold">Sign in to view your orders</h2>
        <Card>
          <CardContent className="pt-6">
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Header title="Track Orders" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Live updates</h2>
            <span className="text-sm text-slate-500">{activeOrders.length} active</span>
          </div>
          {activeOrders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <CookingPot className="h-8 w-8 text-slate-400" />
                <p className="text-sm text-slate-500">
                  Place an order to see cooking progress, token, and ready alerts here.
                </p>
                <Button asChild variant="link" className="text-primary">
                  <Link href="/dashboard" className="inline-flex items-center gap-1">
                    Explore menu <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {activeOrders.map((order) => (
                <Card key={order.id} className="border-slate-200">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Token {order.tokenNumber}</CardTitle>
                      <CardDescription>
                        Paid via {order.paymentMethod} · ₹{order.totalAmount.toFixed(2)}
                      </CardDescription>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Progress value={computeProgress(order.status)} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        {orderSteps.map((step) => (
                          <span key={step.status} className={order.status === step.status ? 'font-semibold text-primary' : ''}>
                            {step.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      {order.items.map((item) => (
                        <div key={item.menuItemId} className="flex justify-between text-slate-600">
                          <span>
                            {item.qty} × {item.name}
                          </span>
                          <span>₹{(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>GST (5%)</span>
                      <span>₹{order.gst.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>Service charge</span>
                      <span>₹{order.serviceCharge.toFixed(2)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex items-center justify-between text-sm text-emerald-600">
                        <span>Coupon savings</span>
                        <span>-₹{order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t pt-3 text-sm font-semibold">
                      <span>Total</span>
                      <span>₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/orders/${order.id}`}>View tracker</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent history</h2>
            <span className="text-sm text-slate-500">{historyOrders.length} completed</span>
          </div>
          {historyOrders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-sm text-slate-500">
                Finished orders will appear here with feedback and rating prompts.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {historyOrders.map((order) => (
                <Card key={order.id} className="border-slate-200">
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Token {order.tokenNumber} • ₹{order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/orders/${order.id}`} className="inline-flex items-center gap-1">
                          Details <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
