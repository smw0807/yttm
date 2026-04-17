import React from 'react';
import type { VideoInfo } from '../../types';

interface Props {
  videoInfo: VideoInfo;
}

export function VideoHeader({ videoInfo }: Props) {
  return (
    <div className="flex gap-3 p-3 bg-gray-50 border-b border-gray-200">
      <img
        src={videoInfo.thumbnail}
        alt={videoInfo.title}
        className="w-20 h-12 object-cover rounded flex-shrink-0"
      />
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">
          {videoInfo.title}
        </p>
        <a
          href={`https://www.youtube.com/watch?v=${videoInfo.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-red-600 hover:underline mt-0.5 block"
        >
          YouTube에서 보기
        </a>
      </div>
    </div>
  );
}
