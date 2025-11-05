import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SharePlate',
  description: 'Building Humanity Through Sharing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
