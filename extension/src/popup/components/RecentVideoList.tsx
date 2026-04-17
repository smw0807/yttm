import React, { useEffect, useState } from 'react';
import { getVideos } from '../../lib/firestore';
import { formatTimestamp } from '../../lib/youtube';
import type { VideoWithId, User } from '../../types';

interface Props {
  user: User;
}

export function RecentVideoList({ user }: Props) {
  const [videos, setVideos] = useState<VideoWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVideos(user.uid)
      .then((vids) => setVideos(vids.slice(0, 5)))
      .finally(() => setLoading(false));
  }, [user.uid]);

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
      {videos.map((video) => (
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
    </div>
  );
}
