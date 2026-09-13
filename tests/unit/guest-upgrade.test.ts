import { FirebaseError } from 'firebase/app';
import { beforeEach, expect, it, vi } from 'vitest';

interface TestUser {
  uid: string;
  isAnonymous: boolean;
  getIdToken: ReturnType<typeof vi.fn>;
}
const sdk = vi.hoisted(() => ({
  auth: { currentUser: null as TestUser | null, authStateReady: vi.fn() },
  link: vi.fn(),
  signIn: vi.fn(),
  popup: vi.fn(),
  credential: vi.fn(),
}));
vi.mock('@/lib/firebase/config', () => ({ app: {}, db: {}, useFirebaseEmulators: false }));
vi.mock('firebase/auth', () => ({
  getAuth: () => sdk.auth,
  GoogleAuthProvider: class {
    static credentialFromError = sdk.credential;
  },
  linkWithPopup: sdk.link,
  signInWithCredential: sdk.signIn,
  signInWithPopup: sdk.popup,
  connectAuthEmulator: vi.fn(),
  signInAnonymously: vi.fn(),
  signOut: vi.fn(),
}));
let request: ReturnType<typeof vi.fn>;
let guest: TestUser;
let google: TestUser;
const collision = () => new FirebaseError('auth/credential-already-in-use', 'already linked');

beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
  guest = { uid: 'guest', isAnonymous: true, getIdToken: vi.fn().mockResolvedValue('guest-token') };
  google = {
    uid: 'google',
    isAnonymous: false,
    getIdToken: vi.fn().mockResolvedValue('google-token'),
  };
  sdk.auth.currentUser = guest;
  sdk.auth.authStateReady.mockResolvedValue(undefined);
  sdk.credential.mockReturnValue({ providerId: 'google.com' });
  sdk.link.mockRejectedValue(collision());
  sdk.signIn.mockImplementation(async () => {
    sdk.auth.currentUser = google;
    return { user: google };
  });
  request = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
  vi.stubGlobal('fetch', request);
});

it('reuses the collision credential, migrates before setting the session, and never opens a second popup', async () => {
  const { upgradeGuestToGoogle } = await import('@/lib/firebase/auth');
  await expect(upgradeGuestToGoogle()).resolves.toBe('migrated');
  expect(sdk.link).toHaveBeenCalledOnce();
  expect(sdk.credential).toHaveBeenCalledWith(
    expect.objectContaining({ code: 'auth/credential-already-in-use' }),
  );
  expect(sdk.signIn).toHaveBeenCalledWith(sdk.auth, { providerId: 'google.com' });
  expect(sdk.popup).not.toHaveBeenCalled();
  expect(request.mock.calls.map(([url]) => url)).toEqual([
    '/api/auth/migrate',
    '/api/auth/session',
  ]);
  expect(JSON.parse(request.mock.calls[0][1].body)).toEqual({ idToken: 'google-token' });
  expect(google.getIdToken).toHaveBeenCalledWith(true);
});

it('links an unused Google identity without migrating data or changing its UID', async () => {
  const linked = { ...google, uid: guest.uid };
  sdk.link.mockImplementation(async () => {
    sdk.auth.currentUser = linked;
    return { user: linked };
  });
  const { upgradeGuestToGoogle } = await import('@/lib/firebase/auth');
  await expect(upgradeGuestToGoogle()).resolves.toBe('linked');
  expect(request.mock.calls.map(([url]) => url)).toEqual(['/api/auth/session']);
  expect(sdk.signIn).not.toHaveBeenCalled();
});

it.each(['auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/network-request-failed'])(
  'propagates %s without migrating or replacing the guest session',
  async (code) => {
    sdk.link.mockRejectedValue(new FirebaseError(code, 'test error'));
    const { upgradeGuestToGoogle } = await import('@/lib/firebase/auth');
    await expect(upgradeGuestToGoogle()).rejects.toMatchObject({ code });
    expect(request).not.toHaveBeenCalled();
    expect(sdk.signIn).not.toHaveBeenCalled();
    expect(sdk.auth.currentUser).toBe(guest);
  },
);

it('does not retry OAuth when the collision has no credential', async () => {
  sdk.credential.mockReturnValue(null);
  const { upgradeGuestToGoogle } = await import('@/lib/firebase/auth');
  await expect(upgradeGuestToGoogle()).rejects.toMatchObject({
    code: 'auth/credential-already-in-use',
  });
  expect(sdk.popup).not.toHaveBeenCalled();
  expect(sdk.signIn).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
});

it('does not touch the server session if credential sign-in fails', async () => {
  sdk.signIn.mockRejectedValue(new FirebaseError('auth/network-request-failed', 'offline'));
  const { upgradeGuestToGoogle } = await import('@/lib/firebase/auth');
  await expect(upgradeGuestToGoogle()).rejects.toThrow('offline');
  expect(request).not.toHaveBeenCalled();
});

it('retries a failed migration with the authenticated target and preserves ordering', async () => {
  request.mockResolvedValueOnce(new Response('{}', { status: 500 }));
  const { upgradeGuestToGoogle } = await import('@/lib/firebase/auth');
  await expect(upgradeGuestToGoogle()).rejects.toThrow('Migration failed');
  expect(request).toHaveBeenCalledTimes(1);
  await expect(upgradeGuestToGoogle()).resolves.toBe('migrated');
  expect(sdk.link).toHaveBeenCalledOnce();
  expect(sdk.signIn).toHaveBeenCalledOnce();
  expect(request.mock.calls.map(([url]) => url)).toEqual([
    '/api/auth/migrate',
    '/api/auth/migrate',
    '/api/auth/session',
  ]);
});

it('retries only the session if migration already succeeded', async () => {
  request.mockResolvedValueOnce(new Response('{}')).mockRejectedValueOnce(new TypeError('offline'));
  const { upgradeGuestToGoogle } = await import('@/lib/firebase/auth');
  await expect(upgradeGuestToGoogle()).rejects.toThrow('offline');
  await expect(upgradeGuestToGoogle()).resolves.toBe('migrated');
  expect(request.mock.calls.map(([url]) => url)).toEqual([
    '/api/auth/migrate',
    '/api/auth/session',
    '/api/auth/session',
  ]);
  expect(sdk.link).toHaveBeenCalledOnce();
});

it('resumes after a reload with a Google client identity and an anonymous server session', async () => {
  sdk.auth.currentUser = google;
  const { upgradeGuestToGoogle } = await import('@/lib/firebase/auth');
  await expect(upgradeGuestToGoogle()).resolves.toBe('migrated');
  expect(sdk.link).not.toHaveBeenCalled();
  expect(sdk.popup).not.toHaveBeenCalled();
  expect(request.mock.calls.map(([url]) => url)).toEqual([
    '/api/auth/migrate',
    '/api/auth/session',
  ]);
});

it('does not bypass a rejected migration on reload recovery', async () => {
  sdk.auth.currentUser = google;
  request.mockResolvedValue(new Response('{}', { status: 401 }));
  const { upgradeGuestToGoogle } = await import('@/lib/firebase/auth');
  await expect(upgradeGuestToGoogle()).rejects.toThrow('Migration failed');
  expect(request).toHaveBeenCalledTimes(1);
});

it('deduplicates concurrent upgrades and allows a retry after failure', async () => {
  sdk.link.mockRejectedValueOnce(new FirebaseError('auth/popup-blocked', 'blocked'));
  const { upgradeGuestToGoogle } = await import('@/lib/firebase/auth');
  const first = upgradeGuestToGoogle();
  expect(upgradeGuestToGoogle()).toBe(first);
  await expect(first).rejects.toThrow('blocked');
  await expect(upgradeGuestToGoogle()).resolves.toBe('migrated');
  expect(sdk.link).toHaveBeenCalledTimes(2);
});

it('rejects a missing client user without opening a popup', async () => {
  sdk.auth.currentUser = null;
  const { upgradeGuestToGoogle } = await import('@/lib/firebase/auth');
  await expect(upgradeGuestToGoogle()).rejects.toThrow('No current user');
  expect(sdk.link).not.toHaveBeenCalled();
});

it('waits for Firebase persistence restoration after a full reload', async () => {
  sdk.auth.currentUser = null;
  sdk.auth.authStateReady.mockImplementation(async () => {
    sdk.auth.currentUser = google;
  });
  const { upgradeGuestToGoogle } = await import('@/lib/firebase/auth');
  await expect(upgradeGuestToGoogle()).resolves.toBe('migrated');
  expect(sdk.auth.authStateReady).toHaveBeenCalledOnce();
  expect(sdk.link).not.toHaveBeenCalled();
});

it('retries the session after a successful new-account link without migration', async () => {
  const linked = { ...google, uid: guest.uid };
  sdk.link.mockImplementation(async () => {
    sdk.auth.currentUser = linked;
    return { user: linked };
  });
  request.mockResolvedValueOnce(new Response('{}', { status: 500 }));
  const { upgradeGuestToGoogle } = await import('@/lib/firebase/auth');
  await expect(upgradeGuestToGoogle()).rejects.toThrow('Session creation failed');
  await expect(upgradeGuestToGoogle()).resolves.toBe('linked');
  expect(request.mock.calls.map(([url]) => url)).toEqual([
    '/api/auth/session',
    '/api/auth/session',
  ]);
  expect(sdk.link).toHaveBeenCalledOnce();
});
