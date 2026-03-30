'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CollectionCard } from './CollectionCard';
import { AddCollectionDialog } from './AddCollectionDialog';
import { CollectionDetailDialog } from './CollectionDetailDialog';
import { deleteCollection } from '@/lib/firebase/firestore';
import type { Collection, Video } from '@/types';

interface Props {
  initialCollections: (Collection & { id: string })[];
  videos: (Video & { id: string })[];
  userId: string;
}

export function CollectionsContent({ initialCollections, videos, userId }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<(Collection & { id: string }) | null>(null);

  function handleAdded() {
    router.refresh();
  }

  function handleDetailClose() {
    setSelectedCollection(null);
    router.refresh();
  }

  async function handleDelete(colId: string) {
    if (!confirm('컬렉션을 삭제하시겠습니까?')) return;
    await deleteCollection(colId);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">컬렉션</h1>
        <Button onClick={() => setAddOpen(true)}>+ 컬렉션 추가</Button>
      </div>

      {initialCollections.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-lg">컬렉션이 없습니다.</p>
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            첫 컬렉션 만들기
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
              onDelete={() => handleDelete(col.id)}
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
    </div>
  );
}
