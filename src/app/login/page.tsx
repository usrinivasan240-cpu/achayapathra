import Image from 'next/image';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAuthSigninForm } from '@/components/auth/user-auth-signin-form';

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex w-full items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 text-white">
        <div className="mx-auto w-full max-w-md">
          <Card className="border-transparent bg-white/5 text-white backdrop-blur">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20">
                <LogIn className="h-6 w-6 text-emerald-300" />
              </div>
              <CardTitle className="font-headline text-3xl">Welcome back</CardTitle>
              <CardDescription className="text-slate-200">
                Sign in to browse menus, manage orders, and monitor campus counters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <UserAuthSigninForm />
              <div className="text-center text-sm text-slate-200">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-semibold text-emerald-200 hover:text-white">
                  Create one
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1542838686-73e5a5c4c43a?auto=format&fit=crop&w=1600&q=80"
          alt="Campus canteen"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/80 via-slate-900/40 to-transparent" />
      </div>
    </div>
  );
}
