'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AddVideoDialog } from '@/components/videos/AddVideoDialog';
import { VideoCard } from '@/components/videos/VideoCard';
import { Button } from '@/components/ui/button';
import type { Video } from '@/types';

interface Props {
  initialVideos: (Video & { id: string })[];
  userId: string;
}

export function DashboardContent({ initialVideos, userId }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);

  function handleAdded() {
    router.refresh(); // 서버 컴포넌트 재실행 → 최신 목록 반영
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 영상</h1>
        <Button onClick={() => setAddOpen(true)}>+ 영상 추가</Button>
      </div>

      {initialVideos.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-lg">등록된 영상이 없습니다.</p>
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            YouTube 영상 추가하기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initialVideos.map((video) => (
            <VideoCard key={video.id} video={video} onDeleted={() => router.refresh()} />
          ))}
        </div>
      )}

      <AddVideoDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={handleAdded}
        userId={userId}
      />
    </div>
  );
}
