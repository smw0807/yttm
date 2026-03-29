'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatTimestamp } from '@/lib/youtube';
import { deleteMemo } from '@/lib/firebase/firestore';
import type { Memo } from '@/types';

interface Props {
  videoId: string;
  memos: Memo[];
  onSeek: (seconds: number) => void;
  onDeleted: () => void;
}

export function MemoList({ videoId, memos, onSeek, onDeleted }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(memoId: string) {
    setDeletingId(memoId);
    await deleteMemo(videoId, memoId);
    onDeleted();
    setDeletingId(null);
  }

  if (memos.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        아직 메모가 없습니다.
        <br />
        영상을 재생하고 시각을 찍어 메모를 저장해보세요.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {memos.map((memo) => (
        <li
          key={memo.id}
          className="group hover:bg-muted/40 flex items-start gap-3 rounded-lg border p-3 transition-colors"
        >
          <button
            onClick={() => onSeek(memo.timestampSec)}
            className="mt-0.5 shrink-0 rounded-md bg-red-100 px-2 py-0.5 font-mono text-xs font-semibold text-red-700 hover:bg-red-200"
          >
            {formatTimestamp(memo.timestampSec)}
          </button>
          <p className="flex-1 text-sm leading-relaxed">{memo.content}</p>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 opacity-0 group-hover:opacity-100"
            onClick={() => handleDelete(memo.id!)}
            disabled={deletingId === memo.id}
          >
            ✕
          </Button>
        </li>
      ))}
    </ul>
  );
}
