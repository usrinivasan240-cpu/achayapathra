
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

export default function FundingQrPage() {
  const qrCodeImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAAPoAQAAAAC/g1xVAAABjElEQVR4nO2WsW7DMAwE4/gAw955go7QCXoEkg7SblnpJSAp/j/SJA8k2RIjFh9rJzDxQh0KgHq8uHjep/e99z28fHx/P15e/v4cfHz/eXn4/cO8+f/T/tP+cT/uP+2f9k/7xP2Y9U/7R2+8T/vS7/uH8Pz/6H0kH0uA0qf0sQdIf9o/7R/9rLp/eH4A3/cf4Xn/tP/0n+6P3t+D+/c+pY/sH+0f/SQfSJ/pPy/U7+b/h+C5/3j/tH/4/+j+6c/6/aP9o/+k+h+BP7f+n/Uf7R/9Jz/uD/ac/8H5I/xD+0f/Sf+i9P6CP3s950D/tH/0l/6j/6f/p95H8D/pH/0l/4H/ef9o/2g/0f/T/pP/zH+H+0f/Z/13x8qf/T/p/2j/6T/dH8sP/eJ+2v+8f/R/9J+0/+L/cf9o/2j/6T+H4P3/p/0n/aP/pA8kQP2f9k/7R/+J+6f9k//J++//uP98/uD++/4B/h+D/18//l+0f/ac/Wl9U//T/pP98v6r/j/af9o/+k//t+0f/D/cP4fn/cf9o/2j/6b8/lP/j/qP9k/+j99f9Q/i+f9o/2j/6T/sX7f/x/pH/0v9T9J/uD+0f/Sf7h/b/vP+0f/SfxL9/rT/pP98f7R/9J/0P/tP+0f/Sf3D/aP/pP/9H/cT+W//A/7R/9J/9o/2j/6X/4/6j/aP/pP+kv/V/xP98/2j/6T/5f4f8P7R/9J/+v+gf0gH0k+4P4f7R/9J//D/af9k/+x/tH/0n/w/7R/9J/+p/uD+H/p/0D+kH2P9I/uH+cP/pP/6P/k/xP+0f/Sf7h/h+A/8/0j/6P0gf6T/uH8H/SP/pP96v2D+H//yQfSJ+H8D/vP+2f9o/2j/6T/cH/x/1H+8f4f7T/9J/1v/h/xD+r9o/2k/+P+kf0k/x/uD8D9I/pP/1+1f7T/pP9I/5f4f6T/SP6b/dP+8f4f9IP9IPtP9Ifgv+n+6f9pP9L8L/pP+n/aP/pP3V+kf/v/R/yL9IP9IP0n/ivxD+H+cP7R/9P/h/iH8D+H+cf4f/x/pH9I/0n/IP6f6Q/J95H8H7J/tP+0f/Sf9Y/uD+cP7R/9J/ur+gf0gfST6QfiD6h/T/oP1E+0D6iQSS/1D8QPiB8APhP1L+Ie1/APgP6D8g/uP1D2k/Un5IP5B9JPuB9B8g/ZD2g/Uj0n8oHyT6T7xP5AfgfwH5J9IHyB+UP4H+g/IP0g+YP2A+Ufyj+UfIj8D/w//Z',
    'image/png'
  );

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
                src={qrCodeImage}
                alt="UPI QR Code"
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
