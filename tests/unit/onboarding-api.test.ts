import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ session: vi.fn(), limit: vi.fn(), apply: vi.fn() }));
vi.mock('@/lib/firebase/admin', () => ({ getSessionUser: mocks.session }));
vi.mock('@/lib/onboarding/metrics', () => ({ applyMetricsCommand: mocks.apply }));
vi.mock('@/lib/api/rate-limit', async (original) => ({
  ...(await original<typeof import('@/lib/api/rate-limit')>()),
  consumeRateLimit: mocks.limit,
}));
import { POST } from '@/app/api/onboarding/route';

function request(body: unknown = { action: 'enable' }, headers: Record<string, string> = {}) {
  return new NextRequest('https://yttm.test/api/onboarding', {
    method: 'POST',
    headers: { origin: 'https://yttm.test', 'x-onboarding-user': 'owner', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.session.mockResolvedValue({ uid: 'owner' });
  mocks.limit.mockResolvedValue({
    allowed: true,
    limit: 30,
    remaining: 29,
    resetAt: Date.now() + 60000,
  });
  mocks.apply.mockResolvedValue('ok');
});

it.each(['https://other.test', '', 'null'])(
  'rejects missing or foreign Origin: %s',
  async (origin) => {
    expect((await POST(request(undefined, { origin }))).status).toBe(403);
    expect(mocks.session).not.toHaveBeenCalled();
  },
);
it('requires a session', async () => {
  mocks.session.mockResolvedValue(null);
  expect((await POST(request())).status).toBe(401);
  expect(mocks.apply).not.toHaveBeenCalled();
});
it('rejects queued events after the logged-in account changes', async () => {
  mocks.session.mockResolvedValue({ uid: 'other' });
  expect((await POST(request())).status).toBe(403);
  expect(mocks.limit).not.toHaveBeenCalled();
});
it.each(['{', { action: 'enable', userId: 'forged' }, { action: 'event', event: 'unknown' }])(
  'rejects invalid payloads: %j',
  async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(mocks.apply).not.toHaveBeenCalled();
  },
);
it('bounds the request body', async () => {
  expect((await POST(request(' '.repeat(1025)))).status).toBe(413);
});
it('rate limits by server UID with retry headers', async () => {
  mocks.limit.mockResolvedValue({
    allowed: false,
    limit: 30,
    remaining: 0,
    resetAt: Date.now() + 60000,
  });
  const response = await POST(request());
  expect(response.status).toBe(429);
  expect(response.headers.get('Retry-After')).toBeTruthy();
  expect(mocks.apply).not.toHaveBeenCalled();
  expect(mocks.limit).toHaveBeenCalledWith(expect.objectContaining({ identifier: 'owner' }));
});
it.each([
  ['consent_required', 409],
  ['not_found', 404],
] as const)('maps %s to %s', async (result, status) => {
  mocks.apply.mockResolvedValue(result);
  expect((await POST(request())).status).toBe(status);
});
it('returns no-store success and keeps guest consent scoped to the session', async () => {
  mocks.session.mockResolvedValue({ uid: 'owner', isAnonymous: true });
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect(mocks.apply).toHaveBeenCalledWith('owner', { action: 'enable' });
});
it('returns a safe response on storage failure', async () => {
  mocks.apply.mockRejectedValue(new Error('sensitive internal error'));
  const response = await POST(request());
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain('sensitive');
});
