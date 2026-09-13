import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  verify: vi.fn(),
  collection: vi.fn(),
  where: vi.fn(),
  get: vi.fn(),
  batch: vi.fn(),
  update: vi.fn(),
  commit: vi.fn(),
}));
vi.mock('@/lib/firebase/admin', () => ({
  getSessionUser: mocks.session,
  adminAuth: { verifyIdToken: mocks.verify },
  adminDb: { collection: mocks.collection, batch: mocks.batch },
}));
import { POST } from '@/app/api/auth/migrate/route';

function request(body: unknown = { idToken: 'target-token' }, origin = 'https://yttm.test') {
  return new NextRequest('https://yttm.test/api/auth/migrate', {
    method: 'POST',
    headers: { origin, host: 'yttm.test', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.session.mockResolvedValue({ uid: 'guest-owner', isAnonymous: true });
  mocks.verify.mockResolvedValue({
    uid: 'google-owner',
    firebase: { sign_in_provider: 'google.com' },
  });
  mocks.collection.mockReturnValue({ where: mocks.where });
  mocks.where.mockReturnValue({ get: mocks.get });
  mocks.get.mockResolvedValue({ docs: [] });
  mocks.batch.mockReturnValue({ update: mocks.update, commit: mocks.commit });
  mocks.commit.mockResolvedValue(undefined);
});

describe('migration authorization', () => {
  it.each([null, { uid: 'regular', isAnonymous: false }])(
    'requires an anonymous session',
    async (session) => {
      mocks.session.mockResolvedValue(session);
      expect((await POST(request())).status).toBe(401);
      expect(mocks.verify).not.toHaveBeenCalled();
      expect(mocks.collection).not.toHaveBeenCalled();
    },
  );
  it('rejects cross-origin calls without touching data', async () => {
    expect((await POST(request({}, 'https://other.test'))).status).toBe(403);
    expect(mocks.session).not.toHaveBeenCalled();
    expect(mocks.collection).not.toHaveBeenCalled();
  });
  it.each([null, {}, { idToken: '' }, { idToken: 123 }])(
    'rejects missing or malformed tokens',
    async (body) => {
      expect((await POST(request(body))).status).toBe(400);
      expect(mocks.verify).not.toHaveBeenCalled();
    },
  );
  it('rejects malformed JSON', async () => {
    const req = new NextRequest('https://yttm.test/api/auth/migrate', {
      method: 'POST',
      body: '{',
    });
    expect((await POST(req)).status).toBe(400);
    expect(mocks.collection).not.toHaveBeenCalled();
  });
  it('rejects revoked tokens and enables revocation checking', async () => {
    mocks.verify.mockRejectedValue(new Error('revoked'));
    expect((await POST(request())).status).toBe(401);
    expect(mocks.verify).toHaveBeenCalledWith('target-token', true);
    expect(mocks.collection).not.toHaveBeenCalled();
  });
  it.each(['anonymous', 'password', 'custom'])('rejects non-Google target %s', async (provider) => {
    mocks.verify.mockResolvedValue({ uid: 'target', firebase: { sign_in_provider: provider } });
    expect((await POST(request())).status).toBe(403);
    expect(mocks.collection).not.toHaveBeenCalled();
  });
  it('ignores a forged guestUid and derives ownership from the session', async () => {
    mocks.get
      .mockResolvedValueOnce({ docs: [{ ref: 'video-ref' }] })
      .mockResolvedValueOnce({ docs: [{ ref: 'collection-ref' }] });
    const response = await POST(request({ guestUid: 'victim', idToken: 'target-token' }));
    expect(await response.json()).toEqual({ success: true, migrated: 2 });
    expect(mocks.where.mock.calls).toEqual([
      ['userId', '==', 'guest-owner'],
      ['userId', '==', 'guest-owner'],
    ]);
    expect(mocks.update.mock.calls).toEqual([
      ['video-ref', { userId: 'google-owner' }],
      ['collection-ref', { userId: 'google-owner' }],
    ]);
  });
  it('does not migrate when the UID is unchanged', async () => {
    mocks.verify.mockResolvedValue({
      uid: 'guest-owner',
      firebase: { sign_in_provider: 'google.com' },
    });
    expect((await POST(request())).status).toBe(200);
    expect(mocks.collection).not.toHaveBeenCalled();
  });
  it('migrates more than one batch of records', async () => {
    mocks.get.mockResolvedValueOnce({
      docs: Array.from({ length: 451 }, (_, i) => ({ ref: `video-${i}` })),
    });
    const response = await POST(request());
    expect((await response.json()).migrated).toBe(451);
    expect(mocks.update).toHaveBeenCalledTimes(451);
    expect(mocks.commit).toHaveBeenCalledTimes(2);
  });
  it('reports write failures instead of success', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.get.mockResolvedValueOnce({ docs: [{ ref: 'video' }] });
    mocks.commit.mockRejectedValue(new Error('write failed'));
    expect((await POST(request())).status).toBe(500);
  });
});
