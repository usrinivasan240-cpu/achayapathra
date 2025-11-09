
'use client';

import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import PlaceHolderImages from '@/lib/placeholder-images.json';

export default function FundingQrPage() {
  const qrCodeImage = PlaceHolderImages.find((img) => img.id === 'qr-code-image');

  if (!qrCodeImage) {
    return (
      <>
        <Header title="Donate" />
        <main className="flex flex-1 flex-col items-center justify-center bg-muted/20 p-4 md:p-8">
            <p>QR Code not found.</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Header title="Donate" />
      <main className="flex flex-1 flex-col items-center justify-center bg-muted/20 p-4 md:p-8">
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center text-center">
            <Avatar className="h-16 w-16 mb-2">
              <AvatarFallback className="text-2xl bg-blue-500 text-white">
                S
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold text-lg">Srinivasan .U</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-lg">
              <Image
                src={qrCodeImage.imageUrl}
                alt={qrCodeImage.description}
                width={256}
                height={256}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">UPI ID:</p>
              <p className="font-mono font-semibold">usrinivasan240@oksbi</p>
            </div>
          </CardContent>
           <CardDescription className="p-6 pt-2 text-center text-sm">
              Scan to pay with any UPI app
            </CardDescription>
        </Card>
      </main>
    </>
  );
}
