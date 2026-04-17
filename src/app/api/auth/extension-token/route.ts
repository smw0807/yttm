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
 * 1. Google accessToken → userinfo API → uid 획득
 * 2. Firebase Admin createCustomToken(uid)
 * 3. 커스텀 토큰 반환 → 익스텐션에서 signInWithCustomToken 사용
 */
export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();
    if (!accessToken) {
      return NextResponse.json({ error: 'accessToken required' }, { status: 400, headers: CORS_HEADERS });
    }

    // Google userinfo로 uid 획득
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userInfoRes.ok) {
      return NextResponse.json({ error: 'Invalid access token' }, { status: 401, headers: CORS_HEADERS });
    }
    const userInfo = await userInfoRes.json() as { sub: string; email?: string; name?: string; picture?: string };

    // Firebase 커스텀 토큰 생성
    const customToken = await adminAuth.createCustomToken(userInfo.sub, {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    });

    return NextResponse.json({ customToken }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error('[extension-token]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: CORS_HEADERS });
  }
}
