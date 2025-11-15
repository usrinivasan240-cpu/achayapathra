'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { cart, removeItem, updateQuantity, getSubtotal, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const subtotal = getSubtotal();
  const gst = subtotal * 0.05;
  const serviceCharge = cart.length * 2;
  const finalTotal = subtotal + gst + serviceCharge - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode,
          totalAmount: subtotal + gst + serviceCharge,
        }),
      });

      if (!response.ok) {
        toast.error('Invalid or expired coupon');
        return;
      }

      const data = await response.json();
      setDiscount(data.discount);
      toast.success(`Coupon applied! Discount: ₹${data.discount.toFixed(2)}`);
    } catch (error: any) {
      toast.error('Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    router.push('/canteen/checkout');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <Link href="/canteen/home" className="flex items-center gap-2 text-orange-600 hover:text-orange-700">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
                <CardDescription>{cart.length} items</CardDescription>
              </CardHeader>

              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
                    <Link href="/canteen/home">
                      <Button className="bg-orange-500 hover:bg-orange-600">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.itemId}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-600">₹{item.price}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(item.itemId, item.quantity - 1)
                              }
                            >
                              −
                            </Button>
                            <span className="w-8 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(item.itemId, item.quantity + 1)
                              }
                            >
                              +
                            </Button>
                          </div>

                          <span className="w-24 text-right font-semibold">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.itemId)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full text-red-500 hover:text-red-700"
                      onClick={() => clearCart()}
                    >
                      Clear Cart
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bill Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Bill Summary</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
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

                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>

                {/* Coupon Section */}
                <div className="mt-4 pt-4 border-t space-y-2">
                  <label className="text-sm font-semibold">Apply Coupon</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={loading}
                    />
                    <Button
                      onClick={applyCoupon}
                      disabled={loading}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {cart.length > 0 && (
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-green-500 hover:bg-green-600 mt-4"
                  >
                    Proceed to Checkout
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
