import { extractYouTubeId } from '../../../shared/utils/youtube';
import type { VideoInfo } from '../types';

export { extractYouTubeId, formatTimestamp, parseDuration } from '../../../shared/utils/youtube';

/**
 * YouTube 영상 메타데이터를 YouTube Data API 없이 DOM에서 추출
 */
export function extractVideoMetaFromDOM(): Omit<VideoInfo, 'youtubeId'> | null {
  // 제목
  const titleEl =
    document.querySelector('h1.ytd-video-primary-info-renderer yt-formatted-string') ||
    document.querySelector('h1.ytd-watch-metadata yt-formatted-string') ||
    document.querySelector('#above-the-fold #title yt-formatted-string');
  const title = titleEl?.textContent?.trim() ?? '';

  // 현재 영상 ID
  const videoId = extractYouTubeId(location.href);
  const thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';

  // 영상 길이: video element
  const videoEl = document.querySelector('video.html5-main-video') as HTMLVideoElement | null;
  const durationSec = videoEl ? Math.floor(videoEl.duration) || 0 : 0;

  if (!title || !videoId) return null;
  return { title, thumbnail, durationSec };
}

/**
 * YouTube video element의 현재 재생 시간 (초)
 */
export function getCurrentTimeSec(): number {
  const videoEl = document.querySelector('video.html5-main-video') as HTMLVideoElement | null;
  return videoEl ? Math.floor(videoEl.currentTime) : 0;
}
