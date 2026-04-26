'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { CollectionCard } from './CollectionCard';
import { AddCollectionDialog } from './AddCollectionDialog';
import { CollectionDetailDialog } from './CollectionDetailDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AdBanner } from '@/components/ads/AdBanner';
import { EmptyState } from '@/components/ui/empty-state';
import { useCollectionDialogs } from '@/hooks/useCollectionDialogs';
import { CARD_GRID } from '@/lib/constants';
import type { CollectionWithId, VideoWithId } from '@/types';

interface Props {
  initialCollections: CollectionWithId[];
  videos: VideoWithId[];
  userId: string;
}

export function CollectionsContent({ initialCollections, videos, userId }: Props) {
  const t = useTranslations('collections');
  const collectionDialogs = useCollectionDialogs();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button onClick={collectionDialogs.openAdd}>{t('addCollection')}</Button>
      </div>

      <AdBanner
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_COLLECTIONS ?? ''}
        format="horizontal"
        className="mb-6 h-24 w-full"
      />

      {initialCollections.length === 0 ? (
        <EmptyState message={t('noCollections')}>
          <Button variant="outline" onClick={collectionDialogs.openAdd}>
            {t('createFirst')}
          </Button>
        </EmptyState>
      ) : (
        <div className={CARD_GRID}>
          {initialCollections.map((col) => (
            <CollectionCard
              key={col.id}
              collection={col}
              videos={videos}
              onClick={() => collectionDialogs.selectCollection(col)}
              onDelete={() => collectionDialogs.requestDelete(col.id)}
            />
          ))}
        </div>
      )}

      <AddCollectionDialog
        open={collectionDialogs.addOpen}
        onClose={collectionDialogs.closeAdd}
        userId={userId}
        onAdded={collectionDialogs.refresh}
      />

      {collectionDialogs.selectedCollection && (
        <CollectionDetailDialog
          open={!!collectionDialogs.selectedCollection}
          onClose={collectionDialogs.closeDetail}
          collection={collectionDialogs.selectedCollection}
          allVideos={videos}
        />
      )}

      <ConfirmDialog
        open={!!collectionDialogs.deleteTargetId}
        title={t('confirmDeleteTitle')}
        description={t('confirmDeleteDesc')}
        confirmLabel={t('confirmDeleteTitle')}
        onConfirm={collectionDialogs.confirmDelete}
        onCancel={collectionDialogs.cancelDelete}
      />
    </div>
  );
}
