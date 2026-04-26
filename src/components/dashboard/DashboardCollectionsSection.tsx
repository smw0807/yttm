'use client';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { CollectionCard } from '@/components/collections/CollectionCard';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeader } from '@/components/ui/section-header';
import { CARD_GRID } from '@/lib/constants';
import type { CollectionWithId, VideoWithId } from '@/types';

interface DashboardCollectionsSectionProps {
  collections: CollectionWithId[];
  videos: VideoWithId[];
  title: string;
  viewAllLabel: string;
  emptyMessage: string;
  createLabel: string;
  onSelect: (collection: CollectionWithId) => void;
  onDelete: (collectionId: string) => void;
}

export function DashboardCollectionsSection({
  collections,
  videos,
  title,
  viewAllLabel,
  emptyMessage,
  createLabel,
  onSelect,
  onDelete,
}: DashboardCollectionsSectionProps) {
  return (
    <div>
      <SectionHeader title={title} viewAllHref="/collections" viewAllLabel={viewAllLabel} />
      {collections.length === 0 ? (
        <EmptyState message={emptyMessage} className="py-12">
          <Link href="/collections">
            <Button variant="outline">{createLabel}</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className={CARD_GRID}>
          {collections.slice(0, 4).map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              videos={videos}
              onClick={() => onSelect(collection)}
              onDelete={() => onDelete(collection.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
