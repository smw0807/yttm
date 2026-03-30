'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AddVideoDialog } from '@/components/videos/AddVideoDialog';
import { VideoCard } from '@/components/videos/VideoCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Video } from '@/types';

interface Props {
  initialVideos: (Video & { id: string })[];
  userId: string;
}

export function VideosContent({ initialVideos, userId }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialVideos;
    return initialVideos.filter((v) => v.title.toLowerCase().includes(q));
  }, [initialVideos, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">영상 목록</h1>
        <Button onClick={() => setAddOpen(true)}>+ 영상 추가</Button>
      </div>

      {/* 검색 입력 */}
      <Input
        placeholder="영상 제목으로 검색..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-6 max-w-sm"
      />

      {initialVideos.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-lg">등록된 영상이 없습니다.</p>
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            YouTube 영상 추가하기
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center">검색 결과가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((video) => (
            <VideoCard key={video.id} video={video} onDeleted={() => router.refresh()} />
          ))}
        </div>
      )}

      <AddVideoDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={() => router.refresh()}
        userId={userId}
      />
    </div>
  );
}
