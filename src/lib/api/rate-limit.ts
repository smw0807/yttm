import 'server-only';

import { createHash } from 'node:crypto';
import { adminDb } from '@/lib/firebase/admin';

interface RateLimitOptions {
  scope: string;
  identifier: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export async function consumeRateLimit({
  scope,
  identifier,
  limit,
  windowMs,
}: RateLimitOptions): Promise<RateLimitResult> {
  if (limit <= 0 || windowMs <= 0) {
    throw new Error('Rate limit and window must be positive');
  }

  const documentId = createHash('sha256').update(`${scope}:${identifier}`).digest('hex');
  const ref = adminDb.collection('_rateLimits').doc(documentId);

  return adminDb.runTransaction(async (transaction) => {
    const now = Date.now();
    const snapshot = await transaction.get(ref);
    const data = snapshot.data();
    const count = typeof data?.count === 'number' ? data.count : 0;
    const storedResetAt = typeof data?.resetAt === 'number' ? data.resetAt : 0;

    if (!snapshot.exists || storedResetAt <= now) {
      const resetAt = now + windowMs;
      transaction.set(ref, { count: 1, resetAt });
      return { allowed: true, limit, remaining: limit - 1, resetAt };
    }

    if (count >= limit) {
      return { allowed: false, limit, remaining: 0, resetAt: storedResetAt };
    }

    transaction.update(ref, { count: count + 1 });
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - count - 1),
      resetAt: storedResetAt,
    };
  });
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}
