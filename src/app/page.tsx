
import Image from 'next/image';
import Link from 'next/link';

import PlaceHolderImages from '@/lib/placeholder-images.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAuthSigninForm } from '@/components/auth/user-auth-signin-form';

export default function AuthenticationPage() {
  const loginImage = PlaceHolderImages.find((img) => img.id === 'login-image');

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline">Sign In</CardTitle>
                    <CardDescription>Enter your email below to sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <UserAuthSigninForm />
                     <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="underline">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {loginImage && (
          <Image
            src="https://picsum.photos/seed/food-donation-drive/1920/1080"
            alt="A person donating food at a food drive."
            width="1920"
            height="1080"
            data-ai-hint="food donation drive"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        )}
      </div>
    </div>
  );
}
