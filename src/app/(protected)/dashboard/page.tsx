"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getVideos } from "@/lib/firebase/firestore";
import { AddVideoDialog } from "@/components/videos/AddVideoDialog";
import { VideoCard } from "@/components/videos/VideoCard";
import { Button } from "@/components/ui/button";
import type { Video } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<(Video & { id: string })[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await getVideos(user.uid);
    setVideos(data as (Video & { id: string })[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 영상</h1>
        <Button onClick={() => setAddOpen(true)}>+ 영상 추가</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
          <p className="text-lg">등록된 영상이 없습니다.</p>
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            YouTube 영상 추가하기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      <AddVideoDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={fetchVideos}
      />
    </div>
  );
}
