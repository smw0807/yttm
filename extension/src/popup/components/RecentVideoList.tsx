import React, { useEffect, useState } from 'react';
import { getVideos } from '../../lib/firestore';
import type { VideoWithId, User } from '../../types';

interface Props {
  user: User;
}

const PAGE_SIZE = 5;

export function RecentVideoList({ user }: Props) {
  const [videos, setVideos] = useState<VideoWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setLoading(true);
    setVisibleCount(PAGE_SIZE);

    getVideos(user.uid)
      .then((vids) => setVideos(vids))
      .finally(() => setLoading(false));
  }, [user.uid]);

  const visibleVideos = videos.slice(0, visibleCount);
  const hasMoreVideos = visibleCount < videos.length;
  const hasOverflow = videos.length > PAGE_SIZE;

  const openWebsite = async () => {
    await chrome.tabs.create({ url: 'https://www.yttm.kr' });
    window.close();
  };

  if (loading) {
    return <div className="px-4 py-3 text-xs text-gray-400">불러오는 중...</div>;
  }

  if (videos.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-gray-400 text-center">
        아직 메모한 영상이 없습니다
      </div>
    );
  }

  return (
    <div>
      <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        최근 영상
      </p>
      {visibleVideos.map((video) => (
        <a
          key={video.id}
          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-16 h-10 object-cover rounded flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs text-gray-800 line-clamp-2 leading-tight">{video.title}</p>
          </div>
        </a>
      ))}
      {hasOverflow && (
        <div className="px-4 py-3 space-y-2">
          {hasMoreVideos && (
            <button
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="w-full rounded-md border border-gray-200 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              더보기
            </button>
          )}
          <button
            onClick={openWebsite}
            className="w-full rounded-md bg-gray-900 py-2 text-xs font-medium text-white hover:bg-black transition-colors"
          >
            www.yttm.kr에서 전체 보기
          </button>
        </div>
      )}
    </div>
  );
}
