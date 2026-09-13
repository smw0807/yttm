import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ mint: vi.fn(), limit: vi.fn(), fetch: vi.fn() }));
vi.mock('@/lib/firebase/admin', () => ({ adminAuth: { createCustomToken: mocks.mint } }));
vi.mock('@/lib/api/rate-limit', async (original) => ({
  ...(await original<typeof import('@/lib/api/rate-limit')>()),
  consumeRateLimit: mocks.limit,
}));
import { OPTIONS, POST } from '@/app/api/auth/extension-token/route';

const success = { localId: 'google-owner', providerId: 'google.com', idToken: 'test-id-token' };
function request(body = JSON.stringify({ accessToken: 'test-access-token' }), headers = {}) {
  return new NextRequest('https://yttm.test/api/auth/extension-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('fetch', mocks.fetch);
  vi.stubEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'test-only');
  mocks.fetch.mockImplementation(async () => Response.json(success));
  mocks.mint.mockResolvedValue('test-custom-token');
  mocks.limit.mockResolvedValue({ allowed: true, limit: 10, remaining: 9, resetAt: 160000 });
});

it('retains extension preflight without auth, upstream calls, or counters', async () => {
  const response = await OPTIONS();
  expect(response.status).toBe(204);
  expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
  expect(mocks.limit).not.toHaveBeenCalled();
  expect(mocks.fetch).not.toHaveBeenCalled();
});

it.each([
  '{',
  'null',
  '[]',
  '{}',
  '"token"',
  '{"accessToken":42}',
  '{"accessToken":{}}',
  '{"accessToken":[]}',
])('rejects invalid JSON or body shape: %s', async (body) => {
  expect((await POST(request(body))).status).toBe(400);
  expect(mocks.limit).not.toHaveBeenCalled();
  expect(mocks.fetch).not.toHaveBeenCalled();
  expect(mocks.mint).not.toHaveBeenCalled();
});

it.each(['', ' ', 'token with spaces', 'token\n', 'x'.repeat(4097)])(
  'rejects invalid token strings',
  async (accessToken) => {
    expect((await POST(request(JSON.stringify({ accessToken })))).status).toBe(400);
    expect(mocks.fetch).not.toHaveBeenCalled();
  },
);

it('rejects non-JSON content types before consuming quota', async () => {
  expect((await POST(request('body', { 'Content-Type': 'text/plain' }))).status).toBe(415);
  expect(mocks.limit).not.toHaveBeenCalled();
});

it.each([{}, { 'Content-Length': '1' }, { 'Content-Length': '9000' }])(
  'bounds body bytes regardless of Content-Length: %j',
  async (headers) => {
    const response = await POST(
      request(JSON.stringify({ accessToken: 'x'.repeat(9000) }), headers),
    );
    expect(response.status).toBe(413);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(mocks.limit).not.toHaveBeenCalled();
  },
);

it('bounds multibyte bodies by bytes, not characters', async () => {
  expect((await POST(request(JSON.stringify({ accessToken: '한'.repeat(3000) })))).status).toBe(
    413,
  );
});

it('accepts the token length boundary and JSON charset parameters', async () => {
  const response = await POST(
    request(JSON.stringify({ accessToken: 'x'.repeat(4096) }), {
      'Content-Type': 'application/json; charset=utf-8',
    }),
  );
  expect(response.status).toBe(200);
});

it('rejects requests without a body', async () => {
  const response = await POST(
    new NextRequest('https://yttm.test/api/auth/extension-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  expect(response.status).toBe(400);
  expect(mocks.limit).not.toHaveBeenCalled();
});

it('cancels a chunked stream as soon as it exceeds the byte limit', async () => {
  const cancel = vi.fn();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(4096));
      controller.enqueue(new Uint8Array(4097));
    },
    cancel,
  });
  const response = await POST(
    new NextRequest('https://yttm.test/api/auth/extension-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }),
  );
  expect(response.status).toBe(413);
  expect(cancel).toHaveBeenCalledOnce();
  expect(mocks.limit).not.toHaveBeenCalled();
});

it('fails closed for missing server configuration', async () => {
  vi.stubEnv('NEXT_PUBLIC_FIREBASE_API_KEY', '');
  expect((await POST(request())).status).toBe(503);
  expect(mocks.limit).not.toHaveBeenCalled();
  expect(mocks.fetch).not.toHaveBeenCalled();
});

describe.each(['global', 'user'])('%s rate limit', (stage) => {
  function block(result: unknown, reject = false) {
    if (stage === 'user')
      mocks.limit.mockResolvedValueOnce({
        allowed: true,
        limit: 120,
        remaining: 119,
        resetAt: 160000,
      });
    if (reject) mocks.limit.mockRejectedValueOnce(result);
    else mocks.limit.mockResolvedValueOnce(result);
  }
  it('returns retry headers and never mints a token', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100000);
    block({ allowed: false, limit: 10, remaining: 0, resetAt: 160000 });
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(response.headers.get('Access-Control-Expose-Headers')).toContain('Retry-After');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(mocks.fetch).toHaveBeenCalledTimes(stage === 'global' ? 0 : 1);
    expect(mocks.mint).not.toHaveBeenCalled();
  });
  it('fails closed without leaking dependency errors', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    block(new Error('secret-from-dependency'), true);
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('secret-from-dependency');
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret-from-dependency');
    expect(mocks.mint).not.toHaveBeenCalled();
  });
});

it('keeps the legacy contract and uses only the Firebase-resolved UID', async () => {
  const response = await POST(
    request(JSON.stringify({ accessToken: 'test-access-token', uid: 'attacker' })),
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ customToken: 'test-custom-token' });
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect(mocks.limit.mock.calls).toEqual([
    [{ scope: 'extension-token-global', identifier: 'all', limit: 120, windowMs: 60000 }],
    [{ scope: 'extension-token-user', identifier: 'google-owner', limit: 10, windowMs: 60000 }],
  ]);
  expect(mocks.mint).toHaveBeenCalledExactlyOnceWith('google-owner');
  const [url, options] = mocks.fetch.mock.calls[0];
  expect(url).toBe(
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=test-only',
  );
  expect(options.cache).toBe('no-store');
  expect(options.signal).toBeInstanceOf(AbortSignal);
  expect(JSON.parse(options.body)).toEqual({
    requestUri: 'http://localhost',
    returnSecureToken: true,
    returnIdpCredential: false,
    postBody: 'access_token=test-access-token&providerId=google.com',
  });
});

it.each([
  null,
  [],
  {},
  { ...success, localId: 123 },
  { ...success, localId: '' },
  { ...success, localId: 'x'.repeat(129) },
  { ...success, providerId: 'facebook.com' },
  { ...success, idToken: '' },
  { ...success, needConfirmation: true },
  { ...success, mfaPendingCredential: 'pending-mfa' },
  { ...success, errorMessage: 'EMAIL_EXISTS' },
  { ...success, error: { message: 'secret' } },
])('does not mint for incomplete or malformed IdP success: %j', async (body) => {
  mocks.fetch.mockResolvedValue(Response.json(body));
  expect((await POST(request())).status).toBe(401);
  expect(mocks.mint).not.toHaveBeenCalled();
  expect(mocks.limit).toHaveBeenCalledTimes(1);
});

it.each([400, 401, 403, 429, 500, 503])('sanitizes upstream HTTP %s', async (status) => {
  mocks.fetch.mockResolvedValue(
    Response.json({ error: { message: 'private-upstream-detail' } }, { status }),
  );
  const response = await POST(request());
  expect(response.status).toBe(status === 429 || status >= 500 ? 503 : 401);
  expect(await response.text()).not.toContain('private-upstream-detail');
  expect(mocks.mint).not.toHaveBeenCalled();
});

it('handles malformed upstream JSON', async () => {
  mocks.fetch.mockResolvedValue(new Response('not JSON'));
  expect((await POST(request())).status).toBe(502);
  expect(mocks.mint).not.toHaveBeenCalled();
});

it.each(['TimeoutError', 'TypeError'])(
  'handles upstream %s without logging tokens',
  async (name) => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.fetch.mockRejectedValue(Object.assign(new Error('test-access-token'), { name }));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('test-access-token');
    expect(log).not.toHaveBeenCalled();
  },
);

it('sanitizes custom-token creation failures', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  mocks.mint.mockRejectedValue(new Error('private-service-account-detail'));
  const response = await POST(request());
  expect(response.status).toBe(500);
  expect(await response.text()).not.toContain('private-service-account-detail');
  expect(log).toHaveBeenCalledExactlyOnceWith('[extension-token] Token creation failed');
});
