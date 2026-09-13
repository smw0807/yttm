'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Collection, Video } from '@/types';

interface Props {
  collection: Collection & { id: string };
  videos: (Video & { id: string })[];
  onClick: () => void;
  onDelete: () => void;
}

export function CollectionCard({ collection, videos, onClick, onDelete }: Props) {
  const t = useTranslations('collections');
  const collectionVideos = videos.filter((v) => collection.videoIds.includes(v.id));
  const previewVideos = collectionVideos.slice(0, 4);

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete();
  }

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer rounded-xl border transition-shadow hover:shadow-md"
    >
      {/* 썸네일 그리드 */}
      {previewVideos.length > 0 ? (
        <div className="grid aspect-video grid-cols-2 gap-0.5 overflow-hidden rounded-t-xl bg-muted">
          {previewVideos.map((video) => (
            <div
              key={video.id}
              className={`relative overflow-hidden ${previewVideos.length === 1 ? 'col-span-2 row-span-2' : ''}`}
            >
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-t-xl bg-muted">
          <span className="text-sm text-muted-foreground">{t('noVideos')}</span>
        </div>
      )}

      <div className="p-3">
        <h3 className="line-clamp-1 font-semibold">{collection.name}</h3>
        {collection.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {collection.description}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {t('videoCount', { count: collectionVideos.length })}
        </p>
      </div>

      {/* 삭제 버튼 */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
        title={t('confirmDeleteTitle')}
      >
        ✕
      </button>
    </div>
  );
}
