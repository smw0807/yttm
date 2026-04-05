'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { formatTimestamp } from '@/lib/youtube';
import { AdBanner } from '@/components/ads/AdBanner';
import { MemoItem } from '@/components/player/MemoItem';
import type { Video, Memo } from '@/types';

interface Props {
  video: Video & { id: string };
  memos: (Memo & { id: string })[];
}

export function ShareViewerClient({ video, memos }: Props) {
  const t = useTranslations('shareViewer');
  const { containerRef, seekTo } = useYouTubePlayer(video.youtubeId);

  return (
    <div className="flex flex-col md:h-screen">
      <header className="flex h-12 items-center justify-between border-b px-4">
        <a href="/" className="flex items-center gap-1.5 font-semibold hover:text-red-700">
          <Image src="/yttm.png" alt="YT Timeline Memo" width={24} height={24} />
          {t('siteTitle')}
        </a>
        <span className="text-muted-foreground min-w-0 truncate text-sm">
          {t('sharedTimeline')} <span className="text-foreground font-medium">{video.title}</span>
        </span>
      </header>

      <AdBanner
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SHARE ?? ''}
        format="horizontal"
        className="h-20 w-full border-b"
      />

      <div className="flex flex-col md:flex-1 md:flex-row md:overflow-hidden">
        {/* 플레이어 (모바일: 상단 / 데스크탑: 좌측 60%) */}
        <div className="flex w-full flex-col gap-3 border-b p-4 md:w-[60%] md:overflow-y-auto md:border-b-0 md:border-r">
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

        {/* 메모 목록 (모바일: 하단 / 데스크탑: 우측 40%) */}
        <div className="flex w-full flex-col gap-2 p-4 md:w-[40%] md:overflow-y-auto">
          <h2 className="text-muted-foreground text-sm font-semibold">
            {t('timeline', { count: memos.length })}
          </h2>
          {memos.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center text-sm">{t('noMemos')}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {memos.map((memo) => (
                <MemoItem
                  key={memo.id}
                  timestampSec={memo.timestampSec}
                  onSeek={seekTo}
                  seekOnItemClick
                >
                  <p className="text-sm leading-relaxed">{memo.content}</p>
                </MemoItem>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
