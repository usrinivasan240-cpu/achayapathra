'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, Coupon } from '@/lib/types';
import { useAppState } from './app-state-provider';

const roundToTwo = (value: number) => Math.round(value * 100) / 100;

export interface CartTotals {
  subtotal: number;
  serviceCharge: number;
  gst: number;
  discount: number;
  total: number;
  totalQuantity: number;
  appliedCoupon: Coupon | null;
}

type CartContextValue = {
  ownerId: string | null;
  items: CartItem[];
  couponCode: string | null;
  totals: CartTotals;
  setCartOwner: (userId: string | null) => void;
  addItem: (item: CartItem) => void;
  increment: (menuItemId: string) => void;
  decrement: (menuItemId: string) => void;
  setItemNotes: (menuItemId: string, notes: string) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  setCouponCode: (code: string | null) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_PREFIX = 'achayapathra-cart';

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { state, validateCoupon, getCouponDiscount } = useAppState();
  const [ownerId, setOwnerIdState] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCodeState] = useState<string | null>(null);

  const storageKey = ownerId ? `${STORAGE_PREFIX}-${ownerId}` : null;

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') {
      setItems([]);
      setCouponCodeState(null);
      return;
    }
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as { items?: CartItem[]; couponCode?: string | null };
        setItems(parsed.items ?? []);
        setCouponCodeState(parsed.couponCode ?? null);
      } else {
        setItems([]);
        setCouponCodeState(null);
      }
    } catch (error) {
      console.warn('Failed to restore cart from storage', error);
      setItems([]);
      setCouponCodeState(null);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ items, couponCode })
      );
    } catch (error) {
      console.warn('Failed to persist cart', error);
    }
  }, [items, couponCode, storageKey]);

  const setCartOwner = useCallback((userId: string | null) => {
    setOwnerIdState(userId);
  }, []);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.menuItemId === item.menuItemId);
      if (!existing) {
        return [...prev, { ...item }];
      }
      return prev.map((entry) =>
        entry.menuItemId === item.menuItemId
          ? { ...entry, qty: entry.qty + item.qty }
          : entry
      );
    });
  }, []);

  const increment = useCallback((menuItemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.menuItemId === menuItemId
          ? { ...item, qty: item.qty + 1 }
          : item
      )
    );
  }, []);

  const decrement = useCallback((menuItemId: string) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, qty: Math.max(0, item.qty - 1) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  }, []);

  const setItemNotes = useCallback((menuItemId: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.menuItemId === menuItemId ? { ...item, notes } : item
      )
    );
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setItems((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponCodeState(null);
  }, []);

  const setCouponCode = useCallback((code: string | null) => {
    setCouponCodeState(code ? code.toUpperCase() : null);
  }, []);

  const totals: CartTotals = useMemo(() => {
    const orderItems = items
      .map((item) => {
        const menuItem = state.menuItems.find((entry) => entry.id === item.menuItemId);
        if (!menuItem) return null;
        return {
          price: menuItem.price,
          qty: item.qty,
        };
      })
      .filter((item): item is { price: number; qty: number } => Boolean(item));

    const subtotal = roundToTwo(
      orderItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    );
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.qty, 0);
    const serviceCharge = roundToTwo(totalQuantity * 2);
    const gst = roundToTwo(subtotal * 0.05);
    const discount = getCouponDiscount(couponCode, subtotal);
    const total = roundToTwo(subtotal + serviceCharge + gst - discount);

    return {
      subtotal,
      serviceCharge,
      gst,
      discount,
      total,
      totalQuantity,
      appliedCoupon: validateCoupon(couponCode),
    } satisfies CartTotals;
  }, [items, couponCode, state.menuItems, getCouponDiscount, validateCoupon]);

  const value = useMemo<CartContextValue>(
    () => ({
      ownerId,
      items,
      couponCode,
      totals,
      setCartOwner,
      addItem,
      increment,
      decrement,
      setItemNotes,
      removeItem,
      clearCart,
      setCouponCode,
    }),
    [
      ownerId,
      items,
      couponCode,
      totals,
      setCartOwner,
      addItem,
      increment,
      decrement,
      setItemNotes,
      removeItem,
      clearCart,
      setCouponCode,
    ]
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
