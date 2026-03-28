"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getVideo, getMemos, addMemo } from "@/lib/firebase/firestore";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { MemoForm } from "@/components/player/MemoForm";
import { MemoList } from "@/components/player/MemoList";
import { formatTimestamp } from "@/lib/youtube";
import type { Video, Memo } from "@/types";

// ── 플레이어 + 메모 영역 (youtubeId 확보 후 마운트) ──────────────────────────
function VideoViewerContent({
  video,
  videoId,
  initialMemos,
}: {
  video: Video;
  videoId: string;
  initialMemos: Memo[];
}) {
  const [memos, setMemos] = useState<Memo[]>(initialMemos);
  const { containerRef, getCurrentTime, seekTo } = useYouTubePlayer(video.youtubeId);

  async function handleSaveMemo(timestampSec: number, content: string) {
    await addMemo(videoId, { timestampSec, content });
    const updated = await getMemos(videoId);
    setMemos(updated);
  }

  async function handleDeleted() {
    const updated = await getMemos(videoId);
    setMemos(updated);
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── 왼쪽 60%: 플레이어 ─────────────────────────── */}
      <div className="flex w-[60%] flex-col gap-3 overflow-y-auto border-r p-4">
        <h1 className="text-base font-semibold leading-snug">{video.title}</h1>

        {/* 16:9 비율 플레이어 컨테이너 */}
        <div className="relative w-full overflow-hidden rounded-xl bg-black" style={{ paddingBottom: "56.25%" }}>
          <div ref={containerRef} className="absolute inset-0" />
        </div>

        <p className="text-xs text-muted-foreground">
          총 길이: {formatTimestamp(video.durationSec)}
        </p>
      </div>

      {/* ── 오른쪽 40%: 메모 ───────────────────────────── */}
      <div className="flex w-[40%] flex-col gap-4 overflow-y-auto p-4">
        <MemoForm onSave={handleSaveMemo} getCurrentTime={getCurrentTime} />

        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            타임라인 ({memos.length}개)
          </h2>
          <MemoList
            videoId={videoId}
            memos={memos}
            onSeek={seekTo}
            onDeleted={handleDeleted}
          />
        </div>
      </div>
    </div>
  );
}

// ── 페이지 진입점 ─────────────────────────────────────────────────────────────
export default function VideoViewerPage() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);

  useEffect(() => {
    Promise.all([getVideo(id), getMemos(id)]).then(([v, m]) => {
      setVideo(v);
      setMemos(m);
    });
  }, [id]);

  if (!video) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <VideoViewerContent video={video} videoId={id} initialMemos={memos} />
  );
}
