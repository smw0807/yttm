import { randomUUID } from 'node:crypto';
import { createHash } from 'node:crypto';
import { afterAll, beforeAll, expect, it, vi } from 'vitest';
import { initializeApp, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { requireEmulator } from './safety';

vi.mock('@/lib/firebase/admin', async () => {
  const { requireEmulator, projectId } = await import('./safety');
  requireEmulator();
  const app = initializeApp({ projectId }, 'rate-limit-tests');
  return { adminDb: getFirestore(app), testApp: app };
});
import { adminDb } from '@/lib/firebase/admin';
import { consumeRateLimit } from '@/lib/api/rate-limit';
import { getApp } from 'firebase-admin/app';

beforeAll(() => {
  requireEmulator();
});
afterAll(async () => {
  await adminDb.terminate();
  await deleteApp(getApp('rate-limit-tests'));
});

const policy = () => ({
  identifier: randomUUID(),
  scope: 'test-search',
  limit: 3,
  windowMs: 60000,
});
it('allows exactly the limit under concurrent requests', async () => {
  const options = policy();
  const results = await Promise.all(Array.from({ length: 6 }, () => consumeRateLimit(options)));
  expect(results.filter((result) => result.allowed)).toHaveLength(3);
  expect(results.filter((result) => !result.allowed)).toHaveLength(3);
  expect(results.every((result) => result.remaining >= 0)).toBe(true);
  expect((await consumeRateLimit(options)).allowed).toBe(false);
});
it('isolates users and endpoint scopes', async () => {
  const options = { ...policy(), limit: 1 };
  expect((await consumeRateLimit(options)).allowed).toBe(true);
  expect((await consumeRateLimit(options)).allowed).toBe(false);
  expect((await consumeRateLimit({ ...options, identifier: randomUUID() })).allowed).toBe(true);
  expect((await consumeRateLimit({ ...options, scope: 'test-video' })).allowed).toBe(true);
});
it('resets expired counters without changing the document identity', async () => {
  const options = policy();
  const id = createHash('sha256').update(`${options.scope}:${options.identifier}`).digest('hex');
  await adminDb
    .collection('_rateLimits')
    .doc(id)
    .set({ count: 3, resetAt: Date.now() - 1 });
  const result = await consumeRateLimit(options);
  expect(result.allowed).toBe(true);
  expect(result.remaining).toBe(2);
  expect(result.resetAt).toBeGreaterThan(Date.now());
});
it('rejects invalid policy configuration', async () => {
  await expect(consumeRateLimit({ ...policy(), limit: 0 })).rejects.toThrow();
  await expect(consumeRateLimit({ ...policy(), windowMs: 0 })).rejects.toThrow();
});
