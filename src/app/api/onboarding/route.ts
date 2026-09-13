import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/firebase/admin';
import { consumeRateLimit, getRateLimitHeaders } from '@/lib/api/rate-limit';
import { parseMetricsCommand } from '@/lib/onboarding/model';
import { applyMetricsCommand } from '@/lib/onboarding/metrics';

export async function POST(request: NextRequest) {
  // This endpoint is browser-only; missing Origin is not accepted.
  if (request.headers.get('origin') !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (request.headers.get('x-onboarding-user') !== user.uid) {
    return NextResponse.json({ error: 'Session changed' }, { status: 403 });
  }
  const raw = await request.text();
  if (raw.length > 1024) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  let command;
  try {
    command = parseMetricsCommand(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!command) return NextResponse.json({ error: 'Invalid command' }, { status: 400 });

  try {
    const result = await consumeRateLimit({
      scope: 'onboarding',
      identifier: user.uid,
      limit: 30,
      windowMs: 60_000,
    });
    const headers = { ...getRateLimitHeaders(result), 'Cache-Control': 'no-store' };
    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))),
          },
        },
      );
    }
    const outcome = await applyMetricsCommand(user.uid, command);
    if (outcome === 'consent_required') {
      return NextResponse.json({ error: 'Consent required' }, { status: 409, headers });
    }
    if (outcome === 'not_found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers });
    }
    return NextResponse.json({ ok: true }, { headers });
  } catch {
    // Do not log request bodies or resource IDs.
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }
}
