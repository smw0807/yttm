'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { formatTimestamp } from '@/lib/youtube';

interface MemoItemProps {
  timestampSec: number;
  onSeek: (seconds: number) => void;
  children: ReactNode;
  actions?: ReactNode;
  /** true이면 li 전체 클릭 시 seek (ShareViewer 용) */
  seekOnItemClick?: boolean;
  /** 타임스탬프 버튼의 aria-label (MemoList 용) */
  seekAriaLabel?: string;
}

export function MemoItem({
  timestampSec,
  onSeek,
  children,
  actions,
  seekOnItemClick = false,
  seekAriaLabel,
}: MemoItemProps) {
  return (
    <li
      onClick={seekOnItemClick ? () => onSeek(timestampSec) : undefined}
      className={cn(
        'hover:bg-muted/40 flex items-start gap-3 rounded-lg border p-3 transition-colors',
        seekOnItemClick ? 'cursor-pointer' : 'group',
      )}
    >
      {seekOnItemClick ? (
        <span className="mt-0.5 shrink-0 rounded-md bg-red-100 px-2 py-0.5 font-mono text-xs font-semibold text-red-700">
          {formatTimestamp(timestampSec)}
        </span>
      ) : (
        <button
          onClick={() => onSeek(timestampSec)}
          aria-label={seekAriaLabel}
          className="mt-0.5 shrink-0 rounded-md bg-red-100 px-2 py-0.5 font-mono text-xs font-semibold text-red-700 hover:bg-red-200"
        >
          {formatTimestamp(timestampSec)}
        </button>
      )}
      {children}
      {actions}
    </li>
  );
}
