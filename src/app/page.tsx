
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUser as useFirebaseUser } from '@/firebase';

export default function HomePage() {
  const router = useRouter();
  const { user: canteenUser, loading: canteenLoading } = useAuth();
  const { user: firebaseUser, isUserLoading: firebaseLoading } = useFirebaseUser();

  useEffect(() => {
    const loading = canteenLoading || firebaseLoading;
    if (!loading) {
      // Prioritize canteen user flow if token/user exists
      if (canteenUser) {
        if (canteenUser.role === 'admin' || canteenUser.role === 'super_admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/canteen/home');
        }
      } 
      // Fallback to firebase user flow
      else if (firebaseUser) {
        router.push('/dashboard');
      }
      // If no user for either system, default to canteen login
      else {
        router.push('/canteen-auth/login');
      }
    }
  }, [canteenUser, firebaseUser, canteenLoading, firebaseLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🍽️ Welcome</h1>
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
