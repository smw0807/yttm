import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ session: vi.fn(), limit: vi.fn(), fetch: vi.fn() }));
vi.mock('@/lib/firebase/admin', () => ({ getSessionUser: mocks.session }));
vi.mock('@/lib/api/rate-limit', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/api/rate-limit')>();
  return { ...original, consumeRateLimit: mocks.limit };
});
import { GET as video } from '@/app/api/youtube/route';
import { GET as search } from '@/app/api/youtube/search/route';

function request(path: string, origin = 'https://yttm.test') {
  return new NextRequest(`https://yttm.test${path}`, { headers: { host: 'yttm.test', origin } });
}
const videoPath = '/api/youtube?url=https://youtu.be/dQw4w9WgXcQ';
const searchPath = '/api/youtube/search?q=react';

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('fetch', mocks.fetch);
  vi.stubEnv('YOUTUBE_API_KEY', 'test-only');
  mocks.session.mockResolvedValue({ uid: 'owner', isAnonymous: false });
  mocks.limit.mockResolvedValue({
    allowed: true,
    limit: 10,
    remaining: 9,
    resetAt: Date.now() + 60000,
  });
});

describe.each([
  { name: 'video', handler: video, path: videoPath },
  { name: 'search', handler: search, path: searchPath },
])('$name API authorization', ({ handler, path }) => {
  it('denies missing sessions before accessing Firestore or YouTube', async () => {
    mocks.session.mockResolvedValue(null);
    expect((await handler(request(path))).status).toBe(401);
    expect(mocks.limit).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it('denies cross-origin requests before auth', async () => {
    expect((await handler(request(path, 'https://other.test'))).status).toBe(403);
    expect(mocks.session).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it('returns retry headers without calling YouTube when limited', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100000);
    mocks.limit.mockResolvedValue({ allowed: false, limit: 10, remaining: 0, resetAt: 160000 });
    const response = await handler(request(path));
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it('fails closed when the limiter is unavailable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.limit.mockRejectedValue(new Error('Firestore unavailable'));
    expect((await handler(request(path))).status).toBe(503);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it('retains authenticated guest access and limits it by UID', async () => {
    mocks.session.mockResolvedValue({ uid: 'guest', isAnonymous: true });
    mocks.fetch.mockResolvedValue(Response.json({ items: [] }));
    await handler(request(path));
    expect(mocks.limit).toHaveBeenCalledWith(expect.objectContaining({ identifier: 'guest' }));
    expect(mocks.fetch).toHaveBeenCalledOnce();
  });
});

it.each(['/api/youtube', '/api/youtube?url=bad'])(
  'rejects invalid video input %s',
  async (path) => {
    expect((await video(request(path))).status).toBe(400);
    expect(mocks.fetch).not.toHaveBeenCalled();
  },
);
it.each(['', '   ', 'x'.repeat(101)])('rejects empty or oversized search', async (query) => {
  expect((await search(request(`/api/youtube/search?q=${encodeURIComponent(query)}`))).status).toBe(
    400,
  );
  expect(mocks.fetch).not.toHaveBeenCalled();
});
it('normalizes search input, batches details, and preserves server cache policies', async () => {
  mocks.fetch
    .mockResolvedValueOnce(Response.json({ items: [{ id: { videoId: 'dQw4w9WgXcQ' } }] }))
    .mockResolvedValueOnce(
      Response.json({
        items: [
          {
            id: 'dQw4w9WgXcQ',
            snippet: { title: 'React', thumbnails: { medium: { url: 'thumb' } } },
            contentDetails: { duration: 'PT1M30S' },
          },
        ],
      }),
    );
  const response = await search(request('/api/youtube/search?q=%20react%20'));
  expect(await response.json()).toEqual([
    { youtubeId: 'dQw4w9WgXcQ', title: 'React', thumbnail: 'thumb', durationSec: 90 },
  ]);
  expect(new URL(mocks.fetch.mock.calls[0][0]).searchParams.get('q')).toBe('react');
  expect(mocks.fetch.mock.calls[0][1]).toEqual({ next: { revalidate: 300 } });
  expect(mocks.fetch.mock.calls[1][1]).toEqual({ next: { revalidate: 21600 } });
});
it('returns video metadata with rate limit headers and caching', async () => {
  mocks.fetch.mockResolvedValue(
    Response.json({
      items: [
        {
          snippet: { title: 'Video', thumbnails: { high: { url: 'thumb' } } },
          contentDetails: { duration: 'PT2M' },
        },
      ],
    }),
  );
  const response = await video(request(videoPath));
  expect(response.status).toBe(200);
  expect(response.headers.get('X-RateLimit-Remaining')).toBe('9');
  expect((await response.json()).durationSec).toBe(120);
  expect(mocks.fetch.mock.calls[0][1]).toEqual({ next: { revalidate: 21600 } });
});
it('handles a malformed upstream response', async () => {
  mocks.fetch.mockResolvedValue(new Response('not JSON', { status: 502 }));
  expect((await video(request(videoPath))).status).toBe(502);
});
it('does not request details when search is empty or fails', async () => {
  mocks.fetch.mockResolvedValue(Response.json({ items: [] }));
  expect(await (await search(request(searchPath))).json()).toEqual([]);
  expect(mocks.fetch).toHaveBeenCalledOnce();
  mocks.fetch
    .mockClear()
    .mockResolvedValue(Response.json({ error: { code: 403, message: 'quota' } }, { status: 403 }));
  expect((await search(request(searchPath))).status).toBe(403);
  expect(mocks.fetch).toHaveBeenCalledOnce();
});
