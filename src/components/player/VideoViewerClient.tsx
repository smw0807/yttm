'use client';

import { useState } from 'react';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { MemoForm } from '@/components/player/MemoForm';
import { MemoList } from '@/components/player/MemoList';
import { ShareDialog } from '@/components/player/ShareDialog';
import { addMemo, getMemos } from '@/lib/firebase/firestore';
import { formatTimestamp } from '@/lib/youtube';
import { Button } from '@/components/ui/button';
import type { Video, Memo } from '@/types';
import { AdBanner } from '@/components/ads/AdBanner';

interface Props {
  video: Video & { id: string };
  videoId: string;
  initialMemos: (Memo & { id: string })[];
}

export function VideoViewerClient({ video, videoId, initialMemos }: Props) {
  const [memos, setMemos] = useState(initialMemos);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareToken, setShareToken] = useState(video.shareToken);
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
    <>
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* ── 왼쪽 60%: 플레이어 ─────────────────────────── */}
        <div className="flex w-[60%] flex-col gap-3 overflow-y-auto border-r p-4">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-base leading-snug font-semibold">{video.title}</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareOpen(true)}
              className="shrink-0"
            >
              공유
            </Button>
          </div>
          <div
            className="yt-player-container relative w-full overflow-hidden rounded-xl bg-black"
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
      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        videoId={videoId}
        token={shareToken}
        onTokenChange={setShareToken}
      />
    </>
  );
}
