import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
} from 'firebase/auth/web-extension';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

async function ensureUserDoc() {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) return;

  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    createdAt: serverTimestamp(),
  });
}

function getChromeAuthToken(interactive: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(new Error(chrome.runtime.lastError?.message ?? 'Auth cancelled'));
      } else {
        resolve(token);
      }
    });
  });
}

async function removeCachedAuthToken(token: string): Promise<void> {
  await new Promise<void>((resolve) => {
    chrome.identity.removeCachedAuthToken({ token }, () => resolve());
  });
}

/**
 * Chrome OAuth access token을 Firebase Google credential로 교환한다.
 * 이 경로를 써야 Firebase 콘솔에서도 Google provider 사용자로 유지된다.
 */
export async function signInWithGoogle(): Promise<void> {
  let accessToken = await getChromeAuthToken(true);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const credential = GoogleAuthProvider.credential(null, accessToken);
      await signInWithCredential(auth, credential);
      await ensureUserDoc();
      return;
    } catch (err) {
      const code =
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        typeof (err as { code?: unknown }).code === 'string'
          ? (err as { code: string }).code
          : '';
      const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
      const shouldRetry =
        attempt === 0 &&
        /auth\/invalid-credential|auth\/network-request-failed/i.test(code || message);

      if (!shouldRetry) {
        throw err instanceof Error ? err : new Error(message);
      }

      await removeCachedAuthToken(accessToken);
      accessToken = await getChromeAuthToken(true);
    }
  }

  throw new Error('Failed to sign in with Google');
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  try {
    const token = await getChromeAuthToken(false);
    await removeCachedAuthToken(token);
  } catch {
    // 캐시된 토큰이 없으면 무시
  }
}
