import { createHash } from 'node:crypto';
import { afterAll, beforeEach, expect, it, vi } from 'vitest';
import { deleteApp, getApp, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const mocks = vi.hoisted(() => ({ session: vi.fn(), isAdmin: vi.fn() }));
vi.mock('@/lib/firebase/admin', async () => {
  const { requireEmulator, projectId } = await import('./safety');
  requireEmulator();
  const app = initializeApp({ projectId }, 'onboarding-tests');
  return { adminDb: getFirestore(app), getSessionUser: mocks.session, isAdmin: mocks.isAdmin };
});
import { adminDb } from '@/lib/firebase/admin';
import { applyMetricsCommand, getOnboardingMetrics } from '@/lib/onboarding/metrics';

const ref = () =>
  adminDb
    .collection('_onboardingMetrics')
    .doc(createHash('sha256').update('onboarding-v1:owner').digest('hex'));
const event = (name: 'video_added' | 'memo_created' | 'timeline_used') =>
  name === 'video_added'
    ? { action: 'event' as const, event: name, videoId: 'onboarding-video' }
    : { action: 'event' as const, event: name, videoId: 'onboarding-video', memoId: 'memo' };

beforeEach(async () => {
  mocks.session.mockResolvedValue({ uid: 'admin' });
  mocks.isAdmin.mockReturnValue(true);
  const docs = await adminDb.collection('_onboardingMetrics').get();
  await Promise.all(docs.docs.map((doc) => doc.ref.delete()));
  await adminDb.doc('videos/onboarding-video').set({ userId: 'owner', title: 'Private title' });
  await adminDb
    .doc('videos/onboarding-video/memos/memo')
    .set({ content: 'Private memo', timestampSec: 5 });
});
afterAll(async () => {
  await adminDb.terminate();
  await deleteApp(getApp('onboarding-tests'));
});

it('requires consent and excludes raw identifiers/content from stored metrics', async () => {
  expect(await applyMetricsCommand('owner', event('video_added'))).toBe('consent_required');
  expect((await ref().get()).exists).toBe(false);
  await applyMetricsCommand('owner', { action: 'enable' });
  await applyMetricsCommand('owner', event('video_added'));
  expect((await ref().get()).data()).toEqual({
    enabled: true,
    step: 1,
    video_added: true,
    memo_created: false,
    timeline_used: false,
  });
});
it('rejects foreign videos and missing memos without advancing the funnel', async () => {
  await applyMetricsCommand('other', { action: 'enable' });
  expect(await applyMetricsCommand('other', event('video_added'))).toBe('not_found');
  await applyMetricsCommand('owner', { action: 'enable' });
  expect(
    await applyMetricsCommand('owner', {
      action: 'event',
      event: 'memo_created',
      videoId: 'onboarding-video',
      memoId: 'missing',
    }),
  ).toBe('not_found');
  expect((await ref().get()).data()?.step).toBe(0);
});
it('deduplicates concurrent events and tolerates delivery out of order', async () => {
  await applyMetricsCommand('owner', { action: 'enable' });
  await applyMetricsCommand('owner', event('timeline_used'));
  expect((await ref().get()).data()?.step).toBe(0);
  await Promise.all([
    applyMetricsCommand('owner', event('video_added')),
    applyMetricsCommand('owner', event('memo_created')),
    applyMetricsCommand('owner', event('video_added')),
  ]);
  expect((await ref().get()).data()?.step).toBe(3);
  expect(await getOnboardingMetrics()).toEqual([1, 1, 1, 1]);
  await applyMetricsCommand('owner', { action: 'enable' });
  expect((await ref().get()).data()?.step).toBe(3);
});
it('withdraws metrics, rejects late events, and starts fresh only on renewed consent', async () => {
  await applyMetricsCommand('owner', { action: 'enable' });
  await applyMetricsCommand('owner', event('video_added'));
  await Promise.all([
    applyMetricsCommand('owner', { action: 'disable' }),
    applyMetricsCommand('owner', event('memo_created')),
  ]);
  expect((await ref().get()).data()).toEqual({ enabled: false });
  expect(await applyMetricsCommand('owner', event('timeline_used'))).toBe('consent_required');
  expect(await getOnboardingMetrics()).toEqual([0, 0, 0, 0]);
  await applyMetricsCommand('owner', { action: 'enable' });
  expect((await ref().get()).data()).toEqual({ enabled: true, step: 0 });
});
it('counts cohorts cumulatively without counting missing earlier milestones', async () => {
  await applyMetricsCommand('owner', { action: 'enable' });
  await applyMetricsCommand('other', { action: 'enable' });
  await applyMetricsCommand('owner', event('memo_created'));
  expect(await getOnboardingMetrics()).toEqual([2, 0, 0, 0]);
  await applyMetricsCommand('owner', event('video_added'));
  expect(await getOnboardingMetrics()).toEqual([2, 1, 1, 0]);
});
it('protects the aggregation helper as well as the admin page', async () => {
  mocks.session.mockResolvedValue(null);
  await expect(getOnboardingMetrics()).rejects.toThrow('Forbidden');
  mocks.session.mockResolvedValue({ uid: 'owner' });
  mocks.isAdmin.mockReturnValue(false);
  await expect(getOnboardingMetrics()).rejects.toThrow('Forbidden');
});
