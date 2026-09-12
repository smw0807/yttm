import { NextRequest, NextResponse } from 'next/server';
import {
  extractYouTubeId,
  isValidYouTubeId,
  parseDuration,
  pickYouTubeThumbnail,
} from '@/lib/youtube';
import { API_ERRORS } from '@/lib/api/errors';
import { authorizeRateLimitedRequest } from '@/lib/api/authorization';

const VIDEO_INFO_CACHE_SECONDS = 60 * 60 * 6;
const VIDEO_INFO_RATE_LIMIT = {
  scope: 'youtube-video-info',
  limit: 30,
  windowMs: 60 * 1000,
};

export async function GET(request: NextRequest) {
  const authorization = await authorizeRateLimitedRequest(request, VIDEO_INFO_RATE_LIMIT);
  if (!authorization.authorized) return authorization.response;

  const json = (body: unknown, status = 200) =>
    NextResponse.json(body, { status, headers: authorization.headers });

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return json({ error: 'url is required' }, 400);
  }

  const youtubeId = extractYouTubeId(url);
  if (!youtubeId || !isValidYouTubeId(youtubeId)) {
    return json({ error: 'Invalid YouTube URL' }, 400);
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return json({ error: API_ERRORS.youtubeApiKeyMissing }, 500);
  }

  try {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&part=snippet,contentDetails&key=${apiKey}`;
    const res = await fetch(apiUrl, { next: { revalidate: VIDEO_INFO_CACHE_SECONDS } });
    const data = await res.json().catch(() => null);

    if (data?.error) {
      return json(
        { error: data.error.message ?? API_ERRORS.youtubeFetchFailed },
        data.error.code ?? 502,
      );
    }

    if (!res.ok || !data) {
      return json({ error: API_ERRORS.youtubeFetchFailed }, 502);
    }

    if (!data.items || data.items.length === 0) {
      return json({ error: 'Video not found' }, 404);
    }

    const item = data.items[0];
    const snippet = item.snippet;
    const durationSec = parseDuration(item.contentDetails.duration);

    return json({
      youtubeId,
      title: snippet.title,
      thumbnail: pickYouTubeThumbnail(snippet.thumbnails),
      durationSec,
    });
  } catch {
    return json({ error: API_ERRORS.youtubeFetchFailed }, 500);
  }
}
