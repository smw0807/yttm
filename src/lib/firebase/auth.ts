'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  linkWithPopup,
  signInAnonymously,
  signOut,
  getAuth,
  connectAuthEmulator,
  type User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { app, db, useFirebaseEmulators } from './config';

const auth = getAuth(app);
if (useFirebaseEmulators && !auth.emulatorConfig) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9098', { disableWarnings: true });
}
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

type UpgradeResult = 'linked' | 'migrated';
// Keep only progress, never OAuth credentials. A failed session refresh can resume
// without repeating a completed migration or opening another popup.
let pendingUpgrade: { uid: string; result: UpgradeResult; needsMigration: boolean } | null = null;
let upgradeInFlight: Promise<UpgradeResult> | null = null;

async function finishGuestUpgrade(user: User): Promise<UpgradeResult> {
  const progress = pendingUpgrade;
  if (!progress || progress.uid !== user.uid) throw new Error('Account changed during upgrade');
  const idToken = await user.getIdToken(true);
  if (progress.needsMigration) {
    // The server still has the anonymous session cookie and determines the source
    // UID itself. Do not replace that cookie until migration succeeds.
    const response = await fetch('/api/auth/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!response.ok) throw new Error('Migration failed');
    progress.needsMigration = false;
  }
  await createSession(idToken);
  pendingUpgrade = null;
  return progress.result;
}

async function performGuestUpgrade(): Promise<UpgradeResult> {
  // Firebase restores its persisted identity asynchronously after a full reload.
  if (!auth.currentUser) await auth.authStateReady();
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No current user');
  if (pendingUpgrade?.uid !== currentUser.uid) pendingUpgrade = null;
  if (!currentUser.isAnonymous) {
    // Also recover after a reload between Firebase sign-in and server migration.
    // The server rejects this unless its session is still anonymous.
    pendingUpgrade ??= { uid: currentUser.uid, result: 'migrated', needsMigration: true };
    return finishGuestUpgrade(currentUser);
  }
  let user: User;
  let result: UpgradeResult;
  try {
    ({ user } = await linkWithPopup(currentUser, provider));
    result = 'linked';
  } catch (err: unknown) {
    if (!(err instanceof FirebaseError) || err.code !== 'auth/credential-already-in-use') throw err;
    const credential = GoogleAuthProvider.credentialFromError(err);
    if (!credential) throw err;
    // Reuse the credential from the first popup. A second asynchronous popup can
    // lose the browser's user activation and fail with auth/popup-blocked.
    ({ user } = await signInWithCredential(auth, credential));
    result = 'migrated';
  }
  pendingUpgrade = { uid: user.uid, result, needsMigration: result === 'migrated' };
  return finishGuestUpgrade(user);
}

export function upgradeGuestToGoogle(): Promise<UpgradeResult> {
  upgradeInFlight ??= performGuestUpgrade().finally(() => {
    upgradeInFlight = null;
  });
  return upgradeInFlight;
}
