'use client';

import { cn } from '@/lib/utils';
import { formatTimestamp } from '@/lib/youtube';

interface MemoTimestampProps {
  timestampSec: number;
  onSeek?: (seconds: number) => void;
  ariaLabel?: string;
  className?: string;
}

const timestampClassName =
  'mt-0.5 shrink-0 rounded-md bg-red-100 px-2 py-0.5 font-mono text-xs font-semibold text-red-700';

export function MemoTimestamp({
  timestampSec,
  onSeek,
  ariaLabel,
  className,
}: MemoTimestampProps) {
  const label = formatTimestamp(timestampSec);

  if (!onSeek) {
    return <span className={cn(timestampClassName, className)}>{label}</span>;
  }

  return (
    <button
      onClick={() => onSeek(timestampSec)}
      aria-label={ariaLabel}
      className={cn(timestampClassName, 'hover:bg-red-200', className)}
    >
      {label}
    </button>
  );
}
