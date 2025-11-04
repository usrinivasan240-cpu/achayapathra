
import Image from 'next/image';
import Link from 'next/link';

import { UserAuthFormTabs } from '@/components/auth/user-auth-form-tabs';
import PlaceHolderImages from '@/lib/placeholder-images.json';

export default function AuthenticationPage() {
  const loginImage = PlaceHolderImages.find((img) => img.id === 'login-image');

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      
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
