import { Inter, Playfair_Display } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppProviders } from '@/components/providers/app-providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-headline' });

export const metadata: Metadata = {
  title: 'Canteen Ordering Platform',
  description: 'Modern MERN powered platform for campus canteen ordering and management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} bg-background text-foreground`}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
