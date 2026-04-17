export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function parseDuration(iso8601: string): number {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? '0');
  const minutes = parseInt(match[2] ?? '0');
  const seconds = parseInt(match[3] ?? '0');
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * YouTube 영상 메타데이터를 YouTube Data API 없이 DOM에서 추출
 */
export function extractVideoMetaFromDOM(): {
  title: string;
  thumbnail: string;
  durationSec: number;
} | null {
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
