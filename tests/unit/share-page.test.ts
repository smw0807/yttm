import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  video: vi.fn(),
  memos: vi.fn(),
  notFound: vi.fn(),
  translations: vi.fn(),
}));
vi.mock('@/lib/firebase/admin-firestore', () => ({
  getVideoByShareTokenAdmin: mocks.video,
  getMemosAdmin: mocks.memos,
}));
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));
vi.mock('next-intl/server', () => ({ getTranslations: mocks.translations }));
vi.mock('@/components/player/ShareViewerClient', () => ({ ShareViewerClient: () => null }));
import SharePage, { generateMetadata } from '@/app/[locale]/share/[token]/page';

beforeEach(() => {
  vi.resetAllMocks();
  mocks.translations.mockResolvedValue((key: string) => key);
  mocks.notFound.mockImplementation(() => {
    throw new Error('NOT_FOUND');
  });
});
it('serves a token-based share while stripping private fields from client props', async () => {
  mocks.video.mockResolvedValue({
    id: 'video-doc',
    youtubeId: 'dQw4w9WgXcQ',
    title: 'Shared',
    durationSec: 60,
    userId: 'private-owner',
    shareToken: 'secret-token',
    createdAt: 1234,
  });
  mocks.memos.mockResolvedValue([
    { id: 'memo', timestampSec: 12, content: 'Note', createdAt: 1234, privateField: 'hidden' },
  ]);
  const result = await SharePage({
    params: Promise.resolve({ token: 'secret-token', locale: 'ko' }),
  });
  expect(mocks.video).toHaveBeenCalledWith('secret-token');
  expect(mocks.memos).toHaveBeenCalledWith('video-doc');
  expect(result.props).toEqual({
    video: { youtubeId: 'dQw4w9WgXcQ', title: 'Shared', durationSec: 60 },
    memos: [{ id: 'memo', timestampSec: 12, content: 'Note' }],
  });
});
it('rejects an absent or revoked share token before reading memos', async () => {
  mocks.video.mockResolvedValue(null);
  await expect(
    SharePage({ params: Promise.resolve({ token: 'revoked', locale: 'ko' }) }),
  ).rejects.toThrow('NOT_FOUND');
  expect(mocks.memos).not.toHaveBeenCalled();
});

it.each([
  ['ko', '/share/public-token'],
  ['en', '/en/share/public-token'],
])(
  'uses the %s share URL and keeps the video thumbnail in social metadata',
  async (locale, path) => {
    const thumbnail = 'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg';
    mocks.video.mockResolvedValue({ title: 'Shared video', thumbnail });

    const metadata = await generateMetadata({
      params: Promise.resolve({ locale, token: 'public-token' }),
    });

    expect(metadata).toMatchObject({
      alternates: { canonical: path },
      openGraph: {
        url: path,
        images: [{ url: thumbnail, width: 1280, height: 720 }],
      },
      twitter: { images: [thumbnail] },
    });
    expect(mocks.memos).not.toHaveBeenCalled();
  },
);

it('does not publish video metadata for a revoked share', async () => {
  mocks.video.mockResolvedValue(null);
  await expect(
    generateMetadata({ params: Promise.resolve({ locale: 'ko', token: 'revoked' }) }),
  ).resolves.toEqual({});
  expect(mocks.translations).not.toHaveBeenCalled();
});
