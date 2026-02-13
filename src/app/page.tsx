'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === 'admin' || user.role === 'super_admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/canteen/home');
        }
      } else {
        router.push('/canteen-auth/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🍽️ Canteen Ordering System</h1>
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
