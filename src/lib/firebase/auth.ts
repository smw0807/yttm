'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  signInAnonymously,
  signOut,
  getAuth,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { app, db } from './config';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth };

async function createSession(idToken: string): Promise<void> {
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error('Session creation failed');
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // 신규 유저 Firestore 저장
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      createdAt: serverTimestamp(),
    });
  }

  const idToken = await user.getIdToken();
  await createSession(idToken);

  return user;
}

export async function logout() {
  await fetch('/api/auth/session', { method: 'DELETE' });
  await signOut(auth);
}

export async function signInAsGuest() {
  const cred = await signInAnonymously(auth);
  const idToken = await cred.user.getIdToken();
  await createSession(idToken);
}

export async function upgradeGuestToGoogle(): Promise<'linked' | 'migrated'> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No current user');
  const guestUid = currentUser.uid;

  try {
    await linkWithPopup(currentUser, provider);
    const idToken = await auth.currentUser!.getIdToken(true);
    await createSession(idToken);
    return 'linked';
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      'code' in err &&
      (err as { code: string }).code === 'auth/credential-already-in-use'
    ) {
      await signInWithPopup(auth, provider);
      const idToken = await auth.currentUser!.getIdToken();
      const migrateRes = await fetch('/api/auth/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestUid, idToken }),
      });
      if (!migrateRes.ok) throw new Error('Migration failed');
      await createSession(idToken);
      return 'migrated';
    }
    throw err;
  }
}
