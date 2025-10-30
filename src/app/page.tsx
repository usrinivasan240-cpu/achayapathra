import Image from 'next/image';
import Link from 'next/link';

import { UserAuthForm } from '@/components/auth/user-auth-form';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AuthenticationPage() {
  const loginImage = PlaceHolderImages.find((img) => img.id === 'login-image');

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">SharePlate</h1>
            <p className="text-balance text-muted-foreground">
              Sign in to share and receive with your community
            </p>
          </div>
          <UserAuthForm />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="#" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {loginImage && (
          <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            width="1920"
            height="1080"
            data-ai-hint={loginImage.imageHint}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        )}
      </div>
    </div>
  );
}
