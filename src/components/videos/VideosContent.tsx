'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { AddVideoDialog } from '@/components/videos/AddVideoDialog';
import { VideoCard } from '@/components/videos/VideoCard';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchField } from '@/components/ui/search-field';
import { useTextFilter } from '@/hooks/useTextFilter';
import { CARD_GRID } from '@/lib/constants';
import type { VideoWithId } from '@/types';

interface Props {
  initialVideos: VideoWithId[];
  userId: string;
}

function getVideoTitle(video: VideoWithId) {
  return video.title;
}

export function VideosContent({ initialVideos }: Props) {
  const router = useRouter();
  const t = useTranslations('videos');
  const [addOpen, setAddOpen] = useState(false);
  const { query, setQuery, filtered } = useTextFilter(initialVideos, getVideoTitle);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button onClick={() => setAddOpen(true)}>{t('addVideo')}</Button>
      </div>

      <SearchField
        placeholder={t('searchPlaceholder')}
        value={query}
        onChange={setQuery}
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
