'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { formatTimestamp } from '@/lib/youtube';
import { deleteVideo } from '@/lib/firebase/firestore';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Video } from '@/types';

interface Props {
  video: Video & { id: string };
  onDeleted: () => void;
}

export function VideoCard({ video, onDeleted }: Props) {
  const t = useTranslations('videoCard');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault();
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    setConfirmOpen(false);
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
      </Link>

      {deleting && <LoadingSpinner overlay />}

      <div className="flex items-start gap-1 p-3">
        <Link href={`/videos/${video.id}`} className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium leading-snug">{video.title}</p>
        </Link>
        <button
          onClick={handleDeleteClick}
          disabled={deleting}
          className="text-muted-foreground hover:text-destructive mt-0.5 shrink-0 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
          title={t('deleteTitle')}
        >
          ✕
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t('deleteTitle')}
        description={t('deleteDesc', { title: video.title })}
        confirmLabel={t('deleteConfirm')}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
