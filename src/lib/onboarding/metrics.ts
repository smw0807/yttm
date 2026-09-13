import 'server-only';

import { createHash } from 'node:crypto';
import { adminDb, getSessionUser, isAdmin } from '@/lib/firebase/admin';
import { funnelStep, ONBOARDING_EVENTS, type MetricsCommand } from './model';

function metricsRef(uid: string) {
  const id = createHash('sha256').update(`onboarding-v1:${uid}`).digest('hex');
  return adminDb.collection('_onboardingMetrics').doc(id);
}

// Only consent and milestone booleans are persisted, never video/memo IDs or contents.
export async function applyMetricsCommand(uid: string, command: MetricsCommand) {
  const ref = metricsRef(uid);
  return adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.data();
    if (command.action === 'disable') {
      // A tombstone also blocks late events from other tabs after withdrawal.
      transaction.set(ref, { enabled: false });
      return 'ok' as const;
    }
    if (command.action === 'enable') {
      if (data?.enabled !== true) transaction.set(ref, { enabled: true, step: 0 });
      return 'ok' as const;
    }
    if (data?.enabled !== true) return 'consent_required' as const;

    const video = await transaction.get(adminDb.collection('videos').doc(command.videoId));
    if (!video.exists || video.data()?.userId !== uid) return 'not_found' as const;
    if (command.event !== 'video_added') {
      const memo = await transaction.get(video.ref.collection('memos').doc(command.memoId));
      if (!memo.exists) return 'not_found' as const;
    }

    const events = Object.fromEntries(
      ONBOARDING_EVENTS.map((event) => [event, event === command.event || data[event] === true]),
    );
    if (data[command.event] !== true) {
      transaction.set(ref, { enabled: true, ...events, step: funnelStep(events) });
    }
    return 'ok' as const;
  });
}

export async function getOnboardingMetrics() {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.uid)) throw new Error('Forbidden');
  // One-field range counts need no composite index. Withdrawn records have no step.
  return Promise.all(
    [0, 1, 2, 3].map(async (step) => {
      const snapshot = await adminDb
        .collection('_onboardingMetrics')
        .where('step', '>=', step)
        .count()
        .get();
      return snapshot.data().count;
    }),
  );
}
