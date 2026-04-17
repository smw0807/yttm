import { signInWithCustomToken, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL as string;

/**
 * getAuthToken() → Next.js /api/auth/extension-token → Firebase customToken
 * redirect URI / OAuth audience 문제 없음
 */
export async function signInWithGoogle(): Promise<void> {
  // 1. Google access token 획득 (Chrome App OAuth 클라이언트 사용)
  const accessToken = await new Promise<string>((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(new Error(chrome.runtime.lastError?.message ?? 'Auth cancelled'));
      } else {
        resolve(token);
      }
    });
  });

  // 2. Next.js API로 Firebase 커스텀 토큰 발급
  const res = await fetch(`${API_URL}/api/auth/extension-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Failed to get custom token');
  }
  const { customToken } = await res.json() as { customToken: string };

  // 3. Firebase 로그인
  await signInWithCustomToken(auth, customToken);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}
