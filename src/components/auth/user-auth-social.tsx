
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2">
        <title>Google</title>
        <path fill="#4285F4" d="M22.56,12.25C22.56,11.47 22.49,10.72 22.36,10H12V14.5H18.28C18.03,16.03 17.3,17.33 16.1,18.15V20.67H19.6C21.6,18.88 22.56,15.83 22.56,12.25Z" />
        <path fill="#34A853" d="M12,23C15.24,23 17.95,21.88 19.6,20.09L16.1,17.57C15.03,18.33 13.63,18.8 12,18.8C9.09,18.8 6.6,16.94 5.7,14.39H2.09V16.94C3.78,20.35 7.58,23 12,23Z" />
        <path fill="#FBBC05" d="M5.7,13.61C5.46,12.86 5.33,12.08 5.33,11.25C5.33,10.42 5.46,9.64 5.7,8.89V6.34H2.09C1.22,7.94 0.75,9.79 0.75,11.75C0.75,13.71 1.22,15.56 2.09,17.16L5.7,14.61V13.61Z" />
        <path fill="#EA4335" d="M12,5.2C13.82,5.2 15.36,5.88 16.5,7.01L19.69,3.82C17.95,2.18 15.24,1 12,1C7.58,1 3.78,3.65 2.09,7.06L5.7,9.61C6.6,7.06 9.09,5.2 12,5.2Z" />
    </svg>
);


export function UserAuthSocial() {
  const [isLoading, setIsLoading] = React.useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Could not connect to authentication service.',
      });
      setIsLoading(false);
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // If user is new, create a document in Firestore
        await setDoc(userDocRef, {
          id: user.uid,
          email: user.email,
          displayName: user.displayName,
          phone: user.phoneNumber || '',
          address: '',
          role: 'donor', // default role
          verified: true, // Google sign-in is considered verified
          points: 0,
          photoURL: user.photoURL,
        });
      }
      
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google Sign-in error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: 'Could not sign in with Google. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      type="button"
      className="w-full"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      Sign In with Google
    </Button>
  );
}
