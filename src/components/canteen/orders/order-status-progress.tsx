"use client";

import { clsx } from 'clsx';

const statusFlow = ['Pending', 'Cooking', 'Ready', 'Delivered'] as const;
export type OrderStatus = (typeof statusFlow)[number] | 'Cancelled' | 'Rejected';

interface OrderStatusProgressProps {
  status: OrderStatus;
}

export const OrderStatusProgress = ({ status }: OrderStatusProgressProps) => {
  const activeIndex = statusFlow.indexOf(status as typeof statusFlow[number]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        {statusFlow.map((step, index) => {
          const isCompleted = activeIndex >= index || status === 'Delivered';
          const isCurrent = index === activeIndex;
          return (
            <div key={step} className="flex flex-1 items-center">
              <div
                className={clsx(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition',
                  isCompleted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30 text-muted-foreground',
                )}
              >
                {index + 1}
              </div>
              {index < statusFlow.length - 1 && (
                <div
                  className={clsx(
                    'mx-2 h-1 flex-1 rounded-full transition-all',
                    activeIndex > index ? 'bg-primary' : 'bg-muted-foreground/30',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        {statusFlow.map((step) => (
          <span key={step}>{step}</span>
        ))}
      </div>
      {['Cancelled', 'Rejected'].includes(status) && (
        <p className="text-sm font-medium text-destructive">Order {status.toLowerCase()}.</p>
      )}
    </div>
  );
};
