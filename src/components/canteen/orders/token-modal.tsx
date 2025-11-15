"use client";

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenNumber: string | null;
  qrCode?: string | null;
}

export const TokenModal = ({ open, onOpenChange, tokenNumber, qrCode }: TokenModalProps) => {
  useEffect(() => {
    if (open && typeof window !== 'undefined') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F97316', '#22D3EE', '#FACC15'],
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl">Order confirmed! 🎉</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Show your token at the counter to collect your delicious meal.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-dashed border-primary/50 bg-primary/10 p-6">
          <p className="text-sm uppercase tracking-wide text-primary">Token number</p>
          <p className="mt-2 font-headline text-4xl">{tokenNumber}</p>
          {qrCode && (
            <img src={qrCode} alt={`QR for token ${tokenNumber}`} className="mx-auto mt-4 h-32 w-32" />
          )}
        </div>
        <Button className="mt-4" onClick={() => onOpenChange(false)}>
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
};
