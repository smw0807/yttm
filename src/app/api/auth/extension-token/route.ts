import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { consumeRateLimit, getRateLimitHeaders } from '@/lib/api/rate-limit';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Expose-Headers':
    'Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset',
  'Cache-Control': 'no-store',
};

const MAX_BODY_BYTES = 8192;
const MAX_TOKEN_LENGTH = 4096;

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: CORS_HEADERS });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Bound streamed bodies too: Content-Length is optional and cannot be trusted.
async function readAccessToken(req: NextRequest): Promise<string | NextResponse> {
  if (req.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return errorResponse('Content-Type must be application/json', 415);
  }
  if (Number(req.headers.get('content-length')) > MAX_BODY_BYTES) {
    return errorResponse('Request body too large', 413);
  }
  if (!req.body) return errorResponse('Invalid request body', 400);

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return errorResponse('Request body too large', 413);
      }
      chunks.push(value);
    }
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (
      !isRecord(body) ||
      typeof body.accessToken !== 'string' ||
      body.accessToken.length === 0 ||
      body.accessToken.length > MAX_TOKEN_LENGTH ||
      /\s/.test(body.accessToken)
    ) {
      return errorResponse('Invalid accessToken', 400);
    }
    return body.accessToken;
  } catch {
    return errorResponse('Invalid request body', 400);
  } finally {
    reader.releaseLock();
  }
}

async function enforceLimit(scope: string, identifier: string, limit: number) {
  try {
    const result = await consumeRateLimit({ scope, identifier, limit, windowMs: 60_000 });
    const headers = { ...CORS_HEADERS, ...getRateLimitHeaders(result) };
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
    return headers;
  } catch {
    // Never log request tokens, upstream response bodies, or credential-bearing errors.
    console.error('[extension-token] Rate limit unavailable');
    return errorResponse('Service temporarily unavailable', 503);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * 구버전 Chrome 익스텐션 호환용. 현재 확장은 signInWithCredential을 직접 사용한다.
 * Body: { accessToken: string }
 * 1. Google accessToken → Firebase accounts:signInWithIdp
 * 2. Firebase가 기존 Google 계정과 동일한 localId(uid) 해석
 * 3. 해당 uid로 커스텀 토큰 반환 → 익스텐션에서 signInWithCustomToken 사용
 */
export async function POST(req: NextRequest) {
  const accessToken = await readAccessToken(req);
  if (accessToken instanceof NextResponse) return accessToken;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return errorResponse('Service temporarily unavailable', 503);

  // Shared budget bounds unauthenticated upstream calls without trusting spoofable IP
  // headers or storing attacker-controlled tokens as an unbounded set of counter keys.
  const budget = await enforceLimit('extension-token-global', 'all', 120);
  if (budget instanceof NextResponse) return budget;

  let idpRes: Response;
  let idpData: unknown;
  try {
    // Firebase Auth가 Google credential을 직접 해석하게 해야
    // 웹앱 signInWithPopup과 동일한 Firebase UID(localId)를 사용한다.
    idpRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({
          requestUri: 'http://localhost',
          returnSecureToken: true,
          returnIdpCredential: false,
          postBody: new URLSearchParams({
            access_token: accessToken,
            providerId: 'google.com',
          }).toString(),
        }),
      },
    );

    idpData = await idpRes.json();
  } catch {
    return errorResponse('Authentication service unavailable', 502);
  }

  if (idpRes.status === 429 || idpRes.status >= 500) {
    return errorResponse('Authentication service unavailable', 503);
  }
  // localId alone is not proof of a completed login: account linking and MFA
  // challenges must not be turned into a custom token that bypasses those steps.
  if (
    !idpRes.ok ||
    !isRecord(idpData) ||
    typeof idpData.localId !== 'string' ||
    idpData.localId.length === 0 ||
    idpData.localId.length > 128 ||
    idpData.providerId !== 'google.com' ||
    typeof idpData.idToken !== 'string' ||
    !idpData.idToken ||
    idpData.needConfirmation ||
    idpData.mfaPendingCredential ||
    idpData.error ||
    idpData.errorMessage
  ) {
    return errorResponse('Invalid Google credential or additional sign-in required', 401);
  }

  const headers = await enforceLimit('extension-token-user', idpData.localId, 10);
  if (headers instanceof NextResponse) return headers;

  try {
    const customToken = await adminAuth.createCustomToken(idpData.localId);
    return NextResponse.json({ customToken }, { headers });
  } catch {
    console.error('[extension-token] Token creation failed');
    return errorResponse('Internal server error', 500);
  }
}
