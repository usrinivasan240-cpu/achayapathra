'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { CartProvider } from '@/contexts/cart-context';

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <CartProvider>{children}</CartProvider>
  </AuthProvider>
);
