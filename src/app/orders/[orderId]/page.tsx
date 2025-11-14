'use client';

import * as React from 'react';
import QRCode from 'react-qr-code';
import { notFound, useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CalendarClock, CookingPot, MessageSquare, Star } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useAppState } from '@/providers/app-state-provider';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

const orderSteps = [
  { status: 'Pending', label: 'Pending confirmation' },
  { status: 'Cooking', label: 'Being prepared' },
  { status: 'Ready', label: 'Ready for pickup' },
  { status: 'Delivered', label: 'Collected' },
];

const statusAccent: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Cooking: 'bg-blue-100 text-blue-700',
  Ready: 'bg-emerald-100 text-emerald-700',
  Delivered: 'bg-slate-200 text-slate-800',
  Cancelled: 'bg-rose-100 text-rose-700',
  Rejected: 'bg-rose-100 text-rose-700',
};

function StatusBadge({ status }: { status: string }) {
  const cls = statusAccent[status] ?? 'bg-slate-200 text-slate-800';
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{status}</span>;
}

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const { state, addReview } = useAppState();
  const { user } = useUser();
  const { toast } = useToast();

  const order = React.useMemo(() => state.orders.find((o) => o.id === params.orderId), [state.orders, params.orderId]);

  const [rating, setRating] = React.useState(5);
  const [feedback, setFeedback] = React.useState('');
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);

  React.useEffect(() => {
    if (!order) {
      notFound();
    }
  }, [order]);

  if (!order) {
    return null;
  }

  const currentIndex = orderSteps.findIndex((step) => step.status === order.status);
  const progressValue = currentIndex === -1 ? 0 : ((currentIndex + 1) / orderSteps.length) * 100;

  const canReview = order.status === 'Delivered';

  const handleSubmitReview = async () => {
    if (!user) return;
    setIsSubmittingReview(true);
    try {
      addReview({
        orderId: order.id,
        menuItemId: order.items[0]?.menuItemId ?? order.id,
        userId: user.uid,
        rating,
        comment: feedback || 'Great meal!',
      });
      toast({
        title: 'Thank you for sharing feedback',
        description: 'Your review helps canteen admins refine menus.',
      });
      setFeedback('');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <>
      <Header title="Order Tracker" />
      <main className="flex flex-1 flex-col gap-6 bg-muted/30 p-4 md:gap-8 md:p-8">
        <Button variant="ghost" className="w-fit" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold text-slate-900">
                  Token {order.tokenNumber}
                </CardTitle>
                <CardDescription>
                  Ordered on {new Date(order.createdAt).toLocaleString()} • Paid via {order.paymentMethod}
                </CardDescription>
              </div>
              <StatusBadge status={order.status} />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Progress value={progressValue} className="h-2" />
                <div className="grid gap-2 md:grid-cols-4">
                  {orderSteps.map((step, idx) => (
                    <div key={step.status} className="flex flex-col gap-1 text-xs">
                      <span className={`font-semibold ${idx <= currentIndex ? 'text-primary' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                      <div className={`h-1 rounded-full ${idx <= currentIndex ? 'bg-primary' : 'bg-slate-200'}`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-800">Order items</h3>
                <div className="divide-y rounded-xl border border-slate-200 bg-white">
                  {order.items.map((item) => (
                    <div key={item.menuItemId} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-slate-800">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">{item.qty} portions</p>
                      </div>
                      <p className="font-semibold text-slate-700">₹{(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                <div className="rounded-xl bg-white p-4">
                  <p className="font-semibold text-slate-800">Billing summary</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST 5%</span>
                      <span>₹{order.gst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service charge</span>
                      <span>₹{order.serviceCharge.toFixed(2)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount</span>
                        <span>-₹{order.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 text-sm font-semibold text-slate-800">
                      <span>Total paid</span>
                      <span>₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white p-4">
                  <p className="font-semibold text-slate-800">Counter details</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Collect at counter {order.counterId.replace(/-/g, ' ')} in {order.canteenId.replace(/-/g, ' ')}.
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <CalendarClock className="h-4 w-4" />
                    Updated {new Date(order.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center">
                <p className="text-xs uppercase tracking-widest text-slate-500">Scan at pickup</p>
                <div className="mx-auto my-4 flex w-fit rounded-2xl bg-white p-4 shadow-inner">
                  <QRCode value={order.tokenNumber} size={140} fgColor="#1d4ed8" />
                </div>
                <p className="text-sm font-semibold text-slate-800">Token {order.tokenNumber}</p>
                <p className="text-xs text-slate-500">Show this QR code at the counter to collect your meal.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-slate-800">
                <CookingPot className="h-4 w-4" /> Kitchen notes
              </CardTitle>
              <CardDescription>
                Share feedback with the canteen team after you collect the meal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rate this order
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                        rating >= value
                          ? 'border-amber-400 bg-amber-100 text-amber-700'
                          : 'border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                      disabled={!canReview}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Feedback
                </label>
                <Textarea
                  placeholder="Let the kitchen know what stood out."
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  disabled={!canReview}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleSubmitReview}
                disabled={!canReview || isSubmittingReview}
              >
                {isSubmittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <MessageSquare className="mr-2 h-4 w-4" /> Submit review
              </Button>
              {!canReview && (
                <p className="text-xs text-slate-400">
                  Reviews unlock once the order is marked delivered by the canteen admin.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
