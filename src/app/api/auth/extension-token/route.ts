import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Chrome 익스텐션용 커스텀 토큰 발급
 * Body: { accessToken: string }
 * 1. Google accessToken → Firebase accounts:signInWithIdp
 * 2. Firebase가 기존 Google 계정과 동일한 localId(uid) 해석
 * 3. 해당 uid로 커스텀 토큰 반환 → 익스텐션에서 signInWithCustomToken 사용
 */
export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();
    if (!accessToken) {
      return NextResponse.json(
        { error: 'accessToken required' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Firebase API key is not configured' },
        { status: 500, headers: CORS_HEADERS },
      );
    }

    // Firebase Auth가 Google credential을 직접 해석하게 해야
    // 웹앱 signInWithPopup과 동일한 Firebase UID(localId)를 사용한다.
    const idpRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestUri: 'http://localhost',
          returnSecureToken: true,
          returnIdpCredential: true,
          postBody: new URLSearchParams({
            access_token: accessToken,
            providerId: 'google.com',
          }).toString(),
        }),
      },
    );

    const idpData = (await idpRes.json().catch(() => ({}))) as {
      localId?: string;
      error?: { message?: string };
    };

    if (!idpRes.ok || !idpData.localId) {
      const errorMessage =
        idpData.error?.message ?? 'Failed to resolve Firebase user from Google token';
      return NextResponse.json({ error: errorMessage }, { status: 401, headers: CORS_HEADERS });
    }

    const customToken = await adminAuth.createCustomToken(idpData.localId);

    return NextResponse.json({ customToken }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error('[extension-token]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
