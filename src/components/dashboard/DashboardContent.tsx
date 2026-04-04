'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { AddVideoDialog } from '@/components/videos/AddVideoDialog';
import { VideoCard } from '@/components/videos/VideoCard';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { CollectionDetailDialog } from '@/components/collections/CollectionDetailDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { AdBanner } from '@/components/ads/AdBanner';
import { deleteCollection } from '@/lib/firebase/firestore';
import type { Video, Collection } from '@/types';

interface Props {
  initialVideos: (Video & { id: string })[];
  initialCollections: (Collection & { id: string })[];
  userId: string;
}

export function DashboardContent({ initialVideos, initialCollections, userId }: Props) {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const tc = useTranslations('collections');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<(Collection & { id: string }) | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  async function handleDeleteCollectionConfirm() {
    if (!deleteTargetId) return;
    await deleteCollection(deleteTargetId);
    setDeleteTargetId(null);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* 페이지 상단: 제목 + 영상 추가 버튼 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button onClick={() => setAddOpen(true)}>{t('addVideo')}</Button>
      </div>

      {/* 광고 배너 */}
      <AdBanner
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD ?? ''}
        format="horizontal"
        className="mb-6 h-24 w-full"
      />

      {/* 영상 섹션 */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('myVideos')}</h2>
          <Link href="/videos" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            {t('viewAll')}
          </Link>
        </div>

        {initialVideos.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-base">{t('noVideos')}</p>
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              {t('addYouTubeVideo')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {initialVideos.slice(0, 4).map((video) => (
              <VideoCard key={video.id} video={video} onDeleted={() => router.refresh()} />
            ))}
          </div>
        )}
      </div>

      {/* 컬렉션 섹션 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('collections')}</h2>
          <Link href="/collections" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            {t('viewAll')}
          </Link>
        </div>

        {initialCollections.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-base">{t('noCollections')}</p>
            <Link href="/collections">
              <Button variant="outline">{t('createCollection')}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {initialCollections.slice(0, 4).map((col) => (
              <CollectionCard
                key={col.id}
                collection={col}
                videos={initialVideos}
                onClick={() => setSelectedCollection(col)}
                onDelete={() => setDeleteTargetId(col.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AddVideoDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={() => router.refresh()}
        userId={userId}
      />

      {selectedCollection && (
        <CollectionDetailDialog
          open={!!selectedCollection}
          onClose={() => {
            setSelectedCollection(null);
            router.refresh();
          }}
          collection={selectedCollection}
          allVideos={initialVideos}
        />
      )}

      <ConfirmDialog
        open={!!deleteTargetId}
        title={tc('confirmDeleteTitle')}
        description={tc('confirmDeleteDesc')}
        confirmLabel={tc('confirmDeleteTitle')}
        onConfirm={handleDeleteCollectionConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
