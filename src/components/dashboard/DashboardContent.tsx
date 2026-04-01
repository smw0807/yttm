'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
      {/* 광고 배너 */}
      <AdBanner
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD ?? ''}
        format="horizontal"
        className="mb-6 h-24 w-full"
      />

      {/* 영상 섹션 */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">내 영상</h2>
          <div className="flex items-center gap-3">
            <Link href="/videos" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              모두 보기 →
            </Link>
            <Button onClick={() => setAddOpen(true)}>+ 영상 추가</Button>
          </div>
        </div>

        {initialVideos.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-base">등록된 영상이 없습니다.</p>
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              YouTube 영상 추가하기
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
          <h2 className="text-xl font-bold">컬렉션</h2>
          <Link href="/collections" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            모두 보기 →
          </Link>
        </div>

        {initialCollections.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-base">컬렉션이 없습니다.</p>
            <Link href="/collections">
              <Button variant="outline">컬렉션 만들기</Button>
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
        title="컬렉션 삭제"
        description="컬렉션을 삭제하시겠습니까? 컬렉션에 포함된 영상은 삭제되지 않습니다."
        confirmLabel="삭제"
        onConfirm={handleDeleteCollectionConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
