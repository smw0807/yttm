'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { MemoForm } from '@/components/player/MemoForm';
import { MemoList } from '@/components/player/MemoList';
import { ShareDialog } from '@/components/player/ShareDialog';
import { addMemo, getMemos } from '@/lib/firebase/firestore';
import { formatTimestamp } from '@/lib/youtube';
import { Button } from '@/components/ui/button';
import type { Video, Memo } from '@/types';

interface Props {
  video: Video & { id: string };
  videoId: string;
  initialMemos: (Memo & { id: string })[];
}

export function VideoViewerClient({ video, videoId, initialMemos }: Props) {
  const t = useTranslations('viewer');
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
      <div className="flex flex-col md:h-[calc(100vh-3.5rem)] md:flex-row md:overflow-hidden">
        {/* ── 플레이어 (모바일: 상단 / 데스크탑: 좌측 60%) ── */}
        <div className="flex w-full flex-col gap-3 border-b p-4 md:w-[60%] md:overflow-y-auto md:border-b-0 md:border-r">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Link
                href="/videos"
                className="text-muted-foreground hover:text-foreground shrink-0 text-sm transition-colors"
              >
                {t('backToList')}
              </Link>
              <h1 className="truncate text-base font-semibold leading-snug">{video.title}</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareOpen(true)}
              className="shrink-0"
            >
              {t('share')}
            </Button>
          </div>
          <div
            className="yt-player-container relative w-full overflow-hidden rounded-xl bg-black"
            style={{ paddingBottom: '56.25%' }}
          >
            <div ref={containerRef} className="absolute inset-0" />
          </div>
          <p className="text-muted-foreground text-xs">
            {t('totalDuration', { duration: formatTimestamp(video.durationSec) })}
          </p>
        </div>

        {/* ── 메모 (모바일: 하단 / 데스크탑: 우측 40%) ────── */}
        <div className="flex w-full flex-col gap-4 p-4 md:w-[40%] md:overflow-y-auto">
          <MemoForm onSave={handleSaveMemo} getCurrentTime={getCurrentTime} />
          <div>
            <h2 className="text-muted-foreground mb-3 text-sm font-semibold">
              {t('timeline', { count: memos.length })}
            </h2>
            <MemoList videoId={videoId} memos={memos} onSeek={seekTo} onDeleted={handleDeleted} onUpdated={refreshMemos} />
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
