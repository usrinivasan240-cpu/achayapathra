
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Copy } from 'lucide-react';
import Link from 'next/link';

export default function FundingPage() {
  const contributionPoints = [
    'Cover server and infrastructure costs.',
    'Support our small, dedicated development team.',
    'Expand our reach to more communities.',
    'Develop new features to improve the platform.',
  ];

  const bankDetails = {
    'Bank Name': 'SharePlate Community Bank',
    'Account Name': 'Achayapathra Foundation',
    'Account Number': '123456789012',
    'IFSC Code': 'SPCB0000001',
  };

  return (
    <>
      <Header title="Support Us" />
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-4xl">
              Support Our Mission
            </CardTitle>
            <CardDescription className="text-md">
              Your generous contribution helps us connect communities and fight
              food waste.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              Achayapathra is run by a passionate team dedicated to making a
              difference. Your donation goes directly towards the operational
              costs of keeping this platform running and growing.
            </p>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-semibold text-center">
                Your Donation Helps Us:
              </h4>
              <ul className="space-y-2 text-sm">
                {contributionPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-center mb-4">
                Donate via Bank Transfer
              </h4>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                {Object.entries(bankDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-mono font-semibold">{value}</span>
                    </div>
                ))}
              </div>
               <p className="text-xs text-muted-foreground text-center mt-2">
                Copy the details above to make a direct bank transfer.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
