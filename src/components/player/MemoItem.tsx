'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { MemoTimestamp } from '@/components/player/MemoTimestamp';

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
      <MemoTimestamp
        timestampSec={timestampSec}
        onSeek={seekOnItemClick ? undefined : onSeek}
        ariaLabel={seekAriaLabel}
      />
      {children}
      {actions}
    </li>
  );
}
