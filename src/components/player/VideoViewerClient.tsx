'use client';

import { useState } from 'react';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { MemoForm } from '@/components/player/MemoForm';
import { MemoList } from '@/components/player/MemoList';
import { addMemo, getMemos } from '@/lib/firebase/firestore';
import { formatTimestamp } from '@/lib/youtube';
import type { Video, Memo } from '@/types';

interface Props {
  video: Video & { id: string };
  videoId: string;
  initialMemos: (Memo & { id: string })[];
}

export function VideoViewerClient({ video, videoId, initialMemos }: Props) {
  const [memos, setMemos] = useState(initialMemos);
  const { containerRef, getCurrentTime, seekTo } = useYouTubePlayer(video.youtubeId);

  async function refreshMemos() {
    const updated = await getMemos(videoId);
    setMemos(updated as (Memo & { id: string })[]);
  }

  async function handleSaveMemo(timestampSec: number, content: string) {
    await addMemo(videoId, { timestampSec, content });
    await refreshMemos();
  }

  async function handleDeleted() {
    await refreshMemos();
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── 왼쪽 60%: 플레이어 ─────────────────────────── */}
      <div className="flex w-[60%] flex-col gap-3 overflow-y-auto border-r p-4">
        <h1 className="text-base leading-snug font-semibold">{video.title}</h1>
        <div
          className="relative w-full overflow-hidden rounded-xl bg-black"
          style={{ paddingBottom: '56.25%' }}
        >
          <div ref={containerRef} className="absolute inset-0" />
        </div>
        <p className="text-muted-foreground text-xs">
          총 길이: {formatTimestamp(video.durationSec)}
        </p>
      </div>

      {/* ── 오른쪽 40%: 메모 ───────────────────────────── */}
      <div className="flex w-[40%] flex-col gap-4 overflow-y-auto p-4">
        <MemoForm onSave={handleSaveMemo} getCurrentTime={getCurrentTime} />
        <div>
          <h2 className="text-muted-foreground mb-3 text-sm font-semibold">
            타임라인 ({memos.length}개)
          </h2>
          <MemoList videoId={videoId} memos={memos} onSeek={seekTo} onDeleted={handleDeleted} />
        </div>
      </div>
    </div>
  );
}
