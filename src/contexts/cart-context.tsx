"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { calculateBill } from '@/lib/billing';

type Coupon = {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  maxDiscount?: number;
};

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
  category?: string;
  type?: 'Veg' | 'Non-Veg';
}

interface CartContextValue {
  items: CartItem[];
  coupon: Coupon | null;
  totals: {
    subtotal: number;
    serviceCharge: number;
    gst: number;
    discount: number;
    total: number;
  };
  addToCart: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  updateQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon | null) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'canteen_cart_v1';

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { items: CartItem[]; coupon: Coupon | null };
        setItems(parsed.items || []);
        setCoupon(parsed.coupon || null);
      }
    } catch (error) {
      // ignore parsing errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const payload = JSON.stringify({ items, coupon });
    window.localStorage.setItem(STORAGE_KEY, payload);
  }, [items, coupon]);

  const addToCart = useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + qty } : cartItem,
        );
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, qty: Math.max(qty, 1) } : item)));
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
  }, []);

  const applyCoupon = useCallback((nextCoupon: Coupon | null) => {
    setCoupon(nextCoupon);
  }, []);

  const totals = useMemo(() => {
    const billItems = items.map((item) => ({ price: item.price, qty: item.qty }));
    return calculateBill(billItems, coupon || undefined);
  }, [items, coupon]);

  const value = useMemo(
    () => ({ items, coupon, totals, addToCart, updateQuantity, removeFromCart, clearCart, applyCoupon }),
    [items, coupon, totals, addToCart, updateQuantity, removeFromCart, clearCart, applyCoupon],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
