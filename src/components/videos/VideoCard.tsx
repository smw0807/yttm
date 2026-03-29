import Image from 'next/image';
import Link from 'next/link';
import { formatTimestamp } from '@/lib/youtube';
import type { Video } from '@/types';

export function VideoCard({ video }: { video: Video & { id: string } }) {
  return (
    <Link
      href={`/videos/${video.id}`}
      className="group block overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
    >
      <div className="bg-muted relative aspect-video">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <span className="absolute right-2 bottom-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
          {formatTimestamp(video.durationSec)}
        </span>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-sm leading-snug font-medium">{video.title}</p>
      </div>
    </Link>
  );
}
