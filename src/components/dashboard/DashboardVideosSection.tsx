'use client';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeader } from '@/components/ui/section-header';
import { VideoCard } from '@/components/videos/VideoCard';
import { CARD_GRID } from '@/lib/constants';
import type { VideoWithId } from '@/types';

interface DashboardVideosSectionProps {
  videos: VideoWithId[];
  title: string;
  viewAllLabel: string;
  emptyMessage: string;
  addButtonLabel: string;
  onAddClick: () => void;
  onChanged: () => void;
}

export function DashboardVideosSection({
  videos,
  title,
  viewAllLabel,
  emptyMessage,
  addButtonLabel,
  onAddClick,
  onChanged,
}: DashboardVideosSectionProps) {
  return (
    <div className="mb-8">
      <SectionHeader title={title} viewAllHref="/videos" viewAllLabel={viewAllLabel} />
      {videos.length === 0 ? (
        <EmptyState message={emptyMessage} className="py-12">
          <Button variant="outline" onClick={onAddClick}>
            {addButtonLabel}
          </Button>
        </EmptyState>
      ) : (
        <div className={CARD_GRID}>
          {videos.slice(0, 4).map((video) => (
            <VideoCard key={video.id} video={video} onDeleted={onChanged} />
          ))}
        </div>
      )}
    </div>
  );
}
