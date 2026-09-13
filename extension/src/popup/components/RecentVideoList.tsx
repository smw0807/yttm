import React, { useEffect, useState } from 'react';
import { getVideos } from '../../lib/firestore';
import type { VideoWithId, User } from '../../types';

interface Props {
  user: User;
}

const PAGE_SIZE = 5;

export function RecentVideoList({ user }: Props) {
  return <RecentVideosForUser key={user.uid} user={user} />;
}

function RecentVideosForUser({ user }: Props) {
  const [videos, setVideos] = useState<VideoWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let active = true;
    getVideos(user.uid)
      .then((vids) => {
        if (active) setVideos(vids);
      })
      .catch((error) => {
        if (active) console.error('[recent-videos]', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
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
      <div className="px-4 py-3 text-center text-xs text-gray-400">아직 메모한 영상이 없습니다</div>
    );
  }

  return (
    <div>
      <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        최근 영상
      </p>
      {visibleVideos.map((video) => (
        <a
          key={video.id}
          href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-3 px-4 py-2 transition-colors hover:bg-gray-50"
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-10 w-16 flex-shrink-0 rounded object-cover"
          />
          <div className="min-w-0">
            <p className="line-clamp-2 text-xs leading-tight text-gray-800">{video.title}</p>
          </div>
        </a>
      ))}
      {hasOverflow && (
        <div className="space-y-2 px-4 py-3">
          {hasMoreVideos && (
            <button
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="w-full rounded-md border border-gray-200 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              더보기
            </button>
          )}
          <button
            onClick={openWebsite}
            className="w-full rounded-md bg-gray-900 py-2 text-xs font-medium text-white transition-colors hover:bg-black"
          >
            www.yttm.kr에서 전체 보기
          </button>
        </div>
      )}
    </div>
  );
}
