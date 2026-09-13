import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ video: vi.fn(), memos: vi.fn(), notFound: vi.fn() }));
vi.mock('@/lib/firebase/admin-firestore', () => ({
  getVideoByShareTokenAdmin: mocks.video,
  getMemosAdmin: mocks.memos,
}));
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn() }));
vi.mock('@/components/player/ShareViewerClient', () => ({ ShareViewerClient: () => null }));
import SharePage from '@/app/[locale]/share/[token]/page';

beforeEach(() => {
  vi.resetAllMocks();
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
