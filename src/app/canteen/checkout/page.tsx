'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { cart, clearCart, getSubtotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [showTokenPopup, setShowTokenPopup] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (cart.length === 0) {
      router.push('/canteen/cart');
    }
  }, [user, router, cart]);

  const subtotal = getSubtotal();
  const gst = subtotal * 0.05;
  const serviceCharge = cart.length * 2;
  const totalAmount = subtotal + gst + serviceCharge;

  const placeOrder = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart,
          subtotal,
          gst,
          serviceCharge,
          totalAmount,
          canteenId: 'default-canteen', // Should be fetched from context/params
          paymentStatus: 'Paid',
        }),
      });

      if (!response.ok) throw new Error('Failed to place order');

      const data = await response.json();
      setOrderData(data.order);
      setShowTokenPopup(true);

      // Trigger confetti animation
      triggerConfetti();

      clearCart();
      toast.success('Order placed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    // Simple confetti implementation
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '9999';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles: any[] = [];

      for (let i = 0; i < 100; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * 5 + 5,
          color: ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d96ff', '#ff9ff3'][
            Math.floor(Math.random() * 5)
          ],
        });
      }

      let frameCount = 0;

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
          p.y += p.vy;
          p.vy += 0.1;
          p.x += p.vx;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        frameCount++;

        if (frameCount < 120) {
          requestAnimationFrame(animate);
        } else {
          canvas.remove();
        }
      };

      animate();
    }
  };

  if (!user || !cart.length) return null;

  if (showTokenPopup && orderData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle>Order Placed Successfully!</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <div>
              <p className="text-gray-600 text-sm mb-2">Your Token Number</p>
              <p className="text-4xl font-bold text-orange-600">{orderData.tokenNumber}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">₹{orderData.totalAmount.toFixed(2)}</p>
            </div>

            <div className="text-sm text-gray-600">
              <p>Status: <span className="font-semibold text-yellow-600">{orderData.status}</span></p>
              <p>You will receive updates on your order status</p>
            </div>

            <Button
              onClick={() => router.push('/canteen/orders')}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              Track Order
            </Button>

            <Button
              onClick={() => {
                setShowTokenPopup(false);
                router.push('/canteen/home');
              }}
              variant="outline"
              className="w-full"
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-orange-600">Checkout</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-4">Items</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.itemId} className="flex justify-between">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>GST (5%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Service Charge</span>
                  <span>₹{serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className="text-green-600">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-sm font-semibold text-green-700 mb-1">✓ Payment Confirmed</p>
                <p className="text-xs text-gray-600">Payment received and verified</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={placeOrder}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 h-12 text-lg"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Back to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
