import React from 'react';
import type { VideoInfo } from '../../types';

interface Props {
  videoInfo: VideoInfo;
}

export function VideoHeader({ videoInfo }: Props) {
  return (
    <div className="flex gap-3 border-b border-gray-200 bg-gray-50 p-3">
      <img
        src={videoInfo.thumbnail}
        alt={videoInfo.title}
        className="h-12 w-20 flex-shrink-0 rounded object-cover"
      />
      <div className="min-w-0">
        <p className="line-clamp-2 text-xs font-medium leading-tight text-gray-900">
          {videoInfo.title}
        </p>
        <a
          href={`https://www.youtube.com/watch?v=${videoInfo.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 block text-xs text-red-600 hover:underline"
        >
          YouTube에서 보기
        </a>
      </div>
    </div>
  );
}
