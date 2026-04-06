'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { AddVideoDialog } from '@/components/videos/AddVideoDialog';
import { VideoCard } from '@/components/videos/VideoCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { CARD_GRID } from '@/lib/constants';
import type { Video } from '@/types';

interface Props {
  initialVideos: (Video & { id: string })[];
  userId: string;
}

export function VideosContent({ initialVideos, userId }: Props) {
  const router = useRouter();
  const t = useTranslations('videos');
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialVideos;
    return initialVideos.filter((v) => v.title.toLowerCase().includes(q));
  }, [initialVideos, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button onClick={() => setAddOpen(true)}>{t('addVideo')}</Button>
      </div>

      <Input
        placeholder={t('searchPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-6 max-w-sm"
      />

      {initialVideos.length === 0 ? (
        <EmptyState message={t('noVideos')}>
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            {t('addYouTubeVideo')}
          </Button>
        </EmptyState>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center">{t('noSearchResults')}</p>
      ) : (
        <div className={CARD_GRID}>
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} onDeleted={() => router.refresh()} />
          ))}
        </div>
      )}

      <AddVideoDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={() => router.refresh()}
      />
    </div>
  );
}
