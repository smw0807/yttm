'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatTimestamp } from '@/lib/youtube';
import { deleteVideo } from '@/lib/firebase/firestore';
import type { Video } from '@/types';

interface Props {
  video: Video & { id: string };
  onDeleted: () => void;
}

export function VideoCard({ video, onDeleted }: Props) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm(`"${video.title}" 영상을 삭제하시겠습니까?`)) return;
    setDeleting(true);
    await deleteVideo(video.id);
    onDeleted();
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border transition-shadow hover:shadow-md">
      <Link href={`/videos/${video.id}`} className="block">
        <div className="bg-muted relative aspect-video">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
            {formatTimestamp(video.durationSec)}
          </span>
        </div>
        <div className="p-3">
          <p className="line-clamp-2 text-sm font-medium leading-snug">{video.title}</p>
        </div>
      </Link>

      {/* 삭제 버튼 */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-muted-foreground hover:text-destructive absolute right-2 top-2 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
        title="삭제"
      >
        ✕
      </button>
    </div>
  );
}
