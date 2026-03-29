'use client';

import { GoogleAuthProvider, signInWithPopup, signOut, getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { app, db } from './config';

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth };

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

  // 서버에 세션 쿠키 발급 요청
  const idToken = await user.getIdToken();
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  return user;
}

export async function logout() {
  await fetch('/api/auth/session', { method: 'DELETE' });
  await signOut(auth);
}
