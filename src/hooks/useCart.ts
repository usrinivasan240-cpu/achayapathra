'use client';

import { useState, useEffect } from 'react';

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          setCart(JSON.parse(storedCart));
        } catch (error) {
          console.error('Failed to parse cart:', error);
        }
      }
      setLoading(false);
    }
  }, []);

  const addItem = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i.itemId === item.itemId);
      if (existingItem) {
        return prevCart.map((i) =>
          i.itemId === item.itemId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prevCart, item];
    });
  };

  const removeItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((i) => i.itemId !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
    } else {
      setCart((prevCart) =>
        prevCart.map((i) => (i.itemId === itemId ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  return {
    cart,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    itemCount: cart.length,
    totalQuantity: cart.reduce((sum, item) => sum + item.quantity, 0),
  };
}
