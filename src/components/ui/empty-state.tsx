'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  message: string;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({ message, children, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'text-muted-foreground flex flex-col items-center justify-center gap-4 py-20',
        className,
      )}
    >
      <p className="text-base">{message}</p>
      {children}
    </div>
  );
}
