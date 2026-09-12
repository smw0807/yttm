import { NextRequest, NextResponse } from 'next/server';
import { parseDuration, pickYouTubeThumbnail } from '@/lib/youtube';
import { API_ERRORS } from '@/lib/api/errors';
import { authorizeRateLimitedRequest } from '@/lib/api/authorization';

const SEARCH_CACHE_SECONDS = 60 * 5;
const VIDEO_DETAILS_CACHE_SECONDS = 60 * 60 * 6;
const SEARCH_RATE_LIMIT = {
  scope: 'youtube-search',
  limit: 10,
  windowMs: 60 * 1000,
};
const MAX_QUERY_LENGTH = 100;

export async function GET(request: NextRequest) {
  const authorization = await authorizeRateLimitedRequest(request, SEARCH_RATE_LIMIT);
  if (!authorization.authorized) return authorization.response;

  const json = (body: unknown, status = 200) =>
    NextResponse.json(body, { status, headers: authorization.headers });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || !q.trim()) {
    return json({ error: 'q is required' }, 400);
  }

  const normalizedQuery = q.trim();
  if (normalizedQuery.length > MAX_QUERY_LENGTH) {
    return json({ error: `q must be ${MAX_QUERY_LENGTH} characters or fewer` }, 400);
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return json({ error: API_ERRORS.youtubeApiKeyMissing }, 500);
  }

  try {
    // Step 1: Search for videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(normalizedQuery)}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: SEARCH_CACHE_SECONDS } });
    const searchData = await searchRes.json().catch(() => null);

    if (searchData?.error) {
      return json(
        { error: searchData.error.message ?? API_ERRORS.youtubeSearchFailed },
        searchData.error.code ?? 502,
      );
    }

    if (!searchRes.ok || !searchData) {
      return json({ error: API_ERRORS.youtubeSearchFailed }, 502);
    }

    if (!searchData.items || searchData.items.length === 0) {
      return json([]);
    }

    // Step 2: Fetch full video details (including duration) in one batch
    const videoIds = searchData.items
      .map((item: { id: { videoId: string } }) => item.id.videoId)
      .join(',');
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${apiKey}`;
    const videosRes = await fetch(videosUrl, {
      next: { revalidate: VIDEO_DETAILS_CACHE_SECONDS },
    });
    const videosData = await videosRes.json().catch(() => null);

    if (videosData?.error) {
      return json(
        { error: videosData.error.message ?? API_ERRORS.youtubeDetailsFailed },
        videosData.error.code ?? 502,
      );
    }

    if (!videosRes.ok || !videosData) {
      return json({ error: API_ERRORS.youtubeDetailsFailed }, 502);
    }

    const results = (videosData.items ?? []).map(
      (item: {
        id: string;
        snippet: { title: string; thumbnails: Record<string, { url: string } | undefined> };
        contentDetails: { duration: string };
      }) => ({
        youtubeId: item.id,
        title: item.snippet.title,
        thumbnail: pickYouTubeThumbnail(item.snippet.thumbnails, ['medium', 'default']),
        durationSec: parseDuration(item.contentDetails.duration),
      }),
    );

    return json(results);
  } catch {
    return json({ error: API_ERRORS.youtubeSearchFailed }, 500);
  }
}
