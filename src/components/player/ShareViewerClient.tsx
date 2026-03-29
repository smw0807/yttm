'use client';

import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { formatTimestamp } from '@/lib/youtube';
import type { Video, Memo } from '@/types';

interface Props {
  video: Video & { id: string };
  memos: (Memo & { id: string })[];
}

export function ShareViewerClient({ video, memos }: Props) {
  const { containerRef, seekTo } = useYouTubePlayer(video.youtubeId);

  return (
    <div className="flex h-screen flex-col">
      <header className="text-muted-foreground flex h-12 items-center border-b px-4 text-sm">
        공유된 타임라인 — <span className="text-foreground ml-1 font-medium">{video.title}</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 플레이어 */}
        <div className="flex w-[60%] flex-col gap-3 overflow-y-auto border-r p-4">
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

        {/* 읽기 전용 메모 목록 */}
        <div className="flex w-[40%] flex-col gap-2 overflow-y-auto p-4">
          <h2 className="text-muted-foreground text-sm font-semibold">
            타임라인 ({memos.length}개)
          </h2>
          {memos.length === 0 ? (
            <p className="text-muted-foreground py-10 text-center text-sm">메모가 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {memos.map((memo) => (
                <li key={memo.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <button
                    onClick={() => seekTo(memo.timestampSec)}
                    className="mt-0.5 shrink-0 rounded-md bg-red-100 px-2 py-0.5 font-mono text-xs font-semibold text-red-700 hover:bg-red-200"
                  >
                    {formatTimestamp(memo.timestampSec)}
                  </button>
                  <p className="text-sm leading-relaxed">{memo.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
