'use client';

import { useTranslations } from 'next-intl';
import { AddVideoDialog } from '@/components/videos/AddVideoDialog';
import { CollectionDetailDialog } from '@/components/collections/CollectionDetailDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { AdBanner } from '@/components/ads/AdBanner';
import { DashboardCollectionsSection } from '@/components/dashboard/DashboardCollectionsSection';
import { DashboardVideosSection } from '@/components/dashboard/DashboardVideosSection';
import { useCollectionDialogs } from '@/hooks/useCollectionDialogs';
import type { CollectionWithId, VideoWithId } from '@/types';

interface Props {
  initialVideos: VideoWithId[];
  initialCollections: CollectionWithId[];
  userId: string;
}

export function DashboardContent({ initialVideos, initialCollections }: Props) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('collections');
  const collectionDialogs = useCollectionDialogs();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button onClick={collectionDialogs.openAdd}>{t('addVideo')}</Button>
      </div>

      <AdBanner
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD ?? ''}
        format="horizontal"
        className="mb-6 h-24 w-full"
      />

      <DashboardVideosSection
        videos={initialVideos}
        title={t('myVideos')}
        viewAllLabel={t('viewAll')}
        emptyMessage={t('noVideos')}
        addButtonLabel={t('addYouTubeVideo')}
        onAddClick={collectionDialogs.openAdd}
        onChanged={collectionDialogs.refresh}
      />

      <DashboardCollectionsSection
        collections={initialCollections}
        videos={initialVideos}
        title={t('collections')}
        viewAllLabel={t('viewAll')}
        emptyMessage={t('noCollections')}
        createLabel={t('createCollection')}
        onSelect={collectionDialogs.selectCollection}
        onDelete={collectionDialogs.requestDelete}
      />

      <AddVideoDialog
        open={collectionDialogs.addOpen}
        onClose={collectionDialogs.closeAdd}
        onAdded={collectionDialogs.refresh}
      />

      {collectionDialogs.selectedCollection && (
        <CollectionDetailDialog
          open={!!collectionDialogs.selectedCollection}
          onClose={collectionDialogs.closeDetail}
          collection={collectionDialogs.selectedCollection}
          allVideos={initialVideos}
        />
      )}

      <ConfirmDialog
        open={!!collectionDialogs.deleteTargetId}
        title={tc('confirmDeleteTitle')}
        description={tc('confirmDeleteDesc')}
        confirmLabel={tc('confirmDeleteTitle')}
        onConfirm={collectionDialogs.confirmDelete}
        onCancel={collectionDialogs.cancelDelete}
      />
    </div>
  );
}
