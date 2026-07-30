'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartHandshake, ShieldCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UserAuthSigninForm } from '@/components/auth/user-auth-signin-form';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🍽️ Welcome to Achayapathra</h1>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 gap-6">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-primary">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <HeartHandshake className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in to your Achayapathra account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthSigninForm />
          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md border-primary/20 bg-primary/5 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Are you an NGO?
          </CardTitle>
          <CardDescription>
            Join our smart redistribution network to manage food requirements efficiently with AI matching.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-all font-bold" asChild>
            <Link href="/signup">Register as NGO Partner</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}