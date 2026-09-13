import { beforeEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { publicConfig } from '../../scripts/firestore-access/config.mjs';
import {
  errorCode,
  expectDenied,
  runProbe,
  validateTargets,
} from '../../scripts/firestore-access/probe';
import type { Firestore } from 'firebase/firestore';

const sdk = vi.hoisted(() => ({
  getDocFromServer: vi.fn(),
  getDocsFromServer: vi.fn(),
}));
vi.mock('firebase/firestore', () => ({
  ...sdk,
  doc: (_db: unknown, ...path: string[]) => path.join('/'),
  collection: (_db: unknown, ...path: string[]) => path.join('/'),
  query: (path: string, ...constraints: unknown[]) => ({ path, constraints }),
  where: (field: string, op: string, value: string) => ({ field, op, value }),
  limit: (count: number) => ({ count }),
}));
beforeEach(() => vi.resetAllMocks());

it('requires an explicit matching production project and exposes only public fields', () => {
  const env = {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'yttm-38af5',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'yttm-38af5.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_API_KEY: 'public-key',
    NEXT_PUBLIC_FIREBASE_APP_ID: 'public-app-id',
    FIREBASE_ADMIN_SDK: 'must-not-be-exported',
    YOUTUBE_API_KEY: 'must-not-be-exported',
  };
  expect(publicConfig(env, 'yttm-38af5')).toEqual({
    projectId: 'yttm-38af5',
    authDomain: 'yttm-38af5.firebaseapp.com',
    apiKey: 'public-key',
    appId: 'public-app-id',
  });
  expect(() => publicConfig(env, undefined)).toThrow('Explicit');
  expect(() =>
    publicConfig({ ...env, NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'other' }, 'yttm-38af5'),
  ).toThrow('Explicit');
  expect(() =>
    publicConfig({ ...env, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'other.test' }, 'yttm-38af5'),
  ).toThrow('auth domain');
});

it.each(['permission-denied', 'unavailable', 'unauthenticated', 'deadline-exceeded'])(
  'only permission-denied counts as denial (%s)',
  async (code) => {
    const result = await expectDenied('read', async () => {
      throw { code };
    });
    expect(result.passed).toBe(code === 'permission-denied');
  },
);
it('treats allowed reads as failures even if they return no document', async () => {
  expect((await expectDenied('read', async () => null)).passed).toBe(false);
});
it('never includes error messages or arbitrary strings in diagnostic errors', () => {
  expect(errorCode(new Error('private data'))).toBe('unknown');
  expect(errorCode({ code: 'secret token 123', message: 'private' })).toBe('unknown');
});
it('rejects equal IDs and paths before issuing any SDK request', async () => {
  expect(() => validateTargets('same', 'same')).toThrow();
  expect(() => validateTargets('videos/one', 'two')).toThrow();
  await expect(runProbe({} as Firestore, 'owner', '', 'two')).rejects.toThrow();
  expect(sdk.getDocFromServer).not.toHaveBeenCalled();
});
it.each([null, { userId: 'someone-else' }])(
  'requires a real owner positive control (%s)',
  async (data) => {
    sdk.getDocFromServer.mockResolvedValue({ exists: () => data !== null, data: () => data });
    await expect(runProbe({} as Firestore, 'owner', 'one', 'two')).rejects.toThrow('소유권');
    expect(sdk.getDocsFromServer).not.toHaveBeenCalled();
  },
);
it('checks the complete read-only matrix with server reads', async () => {
  sdk.getDocFromServer.mockImplementation(async (path) => {
    if (path === 'videos/one') return { exists: () => true, data: () => ({ userId: 'owner' }) };
    throw { code: 'permission-denied' };
  });
  sdk.getDocsFromServer.mockImplementation(async ({ path, constraints }) => {
    if (
      path === 'videos/one/memos' ||
      constraints.some((c: { field?: string }) => c.field === 'userId')
    )
      return { docs: [] };
    throw { code: 'permission-denied' };
  });
  const results = await runProbe({} as Firestore, 'owner', 'one', 'two');
  expect(results).toHaveLength(9);
  expect(results.every((result) => result.passed)).toBe(true);
  expect(sdk.getDocFromServer).toHaveBeenCalledTimes(3);
  expect(sdk.getDocsFromServer).toHaveBeenCalledTimes(6);
});
it('keeps write APIs, token exports and persistent auth out of the client sources', () => {
  const client = readFileSync('scripts/firestore-access/client.ts', 'utf8');
  const probe = readFileSync('scripts/firestore-access/probe.ts', 'utf8');
  expect(client + probe).not.toMatch(
    /\b(setDoc|addDoc|updateDoc|deleteDoc|writeBatch|runTransaction|getIdToken|localStorage|sessionStorage|browserLocalPersistence)\b/,
  );
  expect(client).toContain('inMemoryPersistence');
  expect(probe).toContain('getDocFromServer');
  expect(probe).toContain('getDocsFromServer');
});
