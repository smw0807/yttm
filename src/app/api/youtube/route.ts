import { NextRequest, NextResponse } from 'next/server';
import { extractYouTubeId, parseDuration } from '@/lib/youtube';

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const youtubeId = extractYouTubeId(url);
  if (!youtubeId || !YOUTUBE_ID_REGEX.test(youtubeId)) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
  }

  try {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&part=snippet,contentDetails&key=${apiKey}`;
    const res = await fetch(apiUrl, { next: { revalidate: 60 } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch video info' }, { status: 502 });
    }
    const data = await res.json();

    if (data.error && data.error.code === 403) {
      return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
    }

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const item = data.items[0];
    const snippet = item.snippet;
    const durationSec = parseDuration(item.contentDetails.duration);

    return NextResponse.json({
      youtubeId,
      title: snippet.title,
      thumbnail: snippet.thumbnails.maxres?.url ?? snippet.thumbnails.high.url,
      durationSec,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch video info' }, { status: 500 });
  }
}
