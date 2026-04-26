export const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

interface YouTubeThumbnail {
  url: string;
}

type YouTubeThumbnails = Record<string, YouTubeThumbnail | undefined>;

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

export function isValidYouTubeId(id: string): boolean {
  return YOUTUBE_ID_REGEX.test(id);
}

export function pickYouTubeThumbnail(
  thumbnails: YouTubeThumbnails,
  preference: string[] = ['maxres', 'high', 'medium', 'default'],
): string {
  for (const key of preference) {
    const thumbnail = thumbnails[key];
    if (thumbnail?.url) return thumbnail.url;
  }
  return '';
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
