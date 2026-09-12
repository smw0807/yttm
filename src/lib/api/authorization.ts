import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/firebase/admin';
import { isValidOrigin } from '@/lib/api/validation';
import { consumeRateLimit, getRateLimitHeaders } from '@/lib/api/rate-limit';

interface RateLimitPolicy {
  scope: string;
  limit: number;
  windowMs: number;
}

type AuthorizationResult =
  | { authorized: true; headers: Record<string, string> }
  | { authorized: false; response: NextResponse };

export async function authorizeRateLimitedRequest(
  request: NextRequest,
  policy: RateLimitPolicy,
): Promise<AuthorizationResult> {
  if (!isValidOrigin(request)) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  const user = await getSessionUser();
  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  try {
    const result = await consumeRateLimit({
      ...policy,
      identifier: user.uid,
    });
    const headers = getRateLimitHeaders(result);

    if (!result.allowed) {
      const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Too many requests' },
          {
            status: 429,
            headers: { ...headers, 'Retry-After': String(retryAfter) },
          },
        ),
      };
    }

    return { authorized: true, headers };
  } catch (error) {
    console.error(`[rate-limit] Failed to enforce ${policy.scope}`, error);
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 }),
    };
  }
}
