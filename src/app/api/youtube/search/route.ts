import { NextRequest, NextResponse } from 'next/server';
import { parseDuration, pickYouTubeThumbnail } from '@/lib/youtube';
import { API_ERRORS } from '@/lib/api/errors';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || !q.trim()) {
    return NextResponse.json({ error: 'q is required' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: API_ERRORS.youtubeApiKeyMissing }, { status: 500 });
  }

  try {
    // Step 1: Search for videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(q.trim())}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      return NextResponse.json({ error: API_ERRORS.youtubeSearchFailed }, { status: 502 });
    }
    const searchData = await searchRes.json();

    if (searchData.error?.code === 403) {
      return NextResponse.json({ error: API_ERRORS.youtubeApiKeyMissing }, { status: 500 });
    }

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json([]);
    }

    // Step 2: Fetch full video details (including duration) in one batch
    const videoIds = searchData.items.map((item: { id: { videoId: string } }) => item.id.videoId).join(',');
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${apiKey}`;
    const videosRes = await fetch(videosUrl);
    if (!videosRes.ok) {
      return NextResponse.json({ error: API_ERRORS.youtubeDetailsFailed }, { status: 502 });
    }
    const videosData = await videosRes.json();

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

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: API_ERRORS.youtubeSearchFailed }, { status: 500 });
  }
}
