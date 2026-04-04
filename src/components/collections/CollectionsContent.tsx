'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { CollectionCard } from './CollectionCard';
import { AddCollectionDialog } from './AddCollectionDialog';
import { CollectionDetailDialog } from './CollectionDetailDialog';
import { deleteCollection } from '@/lib/firebase/firestore';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AdBanner } from '@/components/ads/AdBanner';
import type { Collection, Video } from '@/types';

interface Props {
  initialCollections: (Collection & { id: string })[];
  videos: (Video & { id: string })[];
  userId: string;
}

export function CollectionsContent({ initialCollections, videos, userId }: Props) {
  const router = useRouter();
  const t = useTranslations('collections');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<(Collection & { id: string }) | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  function handleAdded() {
    router.refresh();
  }

  function handleDetailClose() {
    setSelectedCollection(null);
    router.refresh();
  }

  async function handleDeleteConfirm() {
    if (!deleteTargetId) return;
    await deleteCollection(deleteTargetId);
    setDeleteTargetId(null);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button onClick={() => setAddOpen(true)}>{t('addCollection')}</Button>
      </div>

      {/* 광고 배너 */}
      <AdBanner
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_COLLECTIONS ?? ''}
        format="horizontal"
        className="mb-6 h-24 w-full"
      />

      {initialCollections.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-lg">{t('noCollections')}</p>
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            {t('createFirst')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initialCollections.map((col) => (
            <CollectionCard
              key={col.id}
              collection={col}
              videos={videos}
              onClick={() => setSelectedCollection(col)}
              onDelete={() => setDeleteTargetId(col.id)}
            />
          ))}
        </div>
      )}

      <AddCollectionDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        userId={userId}
        onAdded={handleAdded}
      />

      {selectedCollection && (
        <CollectionDetailDialog
          open={!!selectedCollection}
          onClose={handleDetailClose}
          collection={selectedCollection}
          allVideos={videos}
        />
      )}

      <ConfirmDialog
        open={!!deleteTargetId}
        title={t('confirmDeleteTitle')}
        description={t('confirmDeleteDesc')}
        confirmLabel={t('confirmDeleteTitle')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
