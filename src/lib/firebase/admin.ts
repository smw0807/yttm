import 'server-only';

import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { cache } from 'react';
import { cookies } from 'next/headers';

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_ADMIN_SDK!, 'base64').toString(),
  );

  return initializeApp({ credential: cert(serviceAccount) });
}

const app = getAdminApp();
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

export function isAdmin(uid: string): boolean {
  const adminUids = (process.env.ADMIN_UIDS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return adminUids.includes(uid);
}

/** 요청당 1회 실행 (React cache) - session cookie → DecodedIdToken */
export const getSessionUser = cache(async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const isAnonymous = decoded.firebase?.sign_in_provider === 'anonymous';
    return { uid: decoded.uid, email: decoded.email ?? null, name: decoded.name ?? null, isAnonymous };
  } catch {
    return null;
  }
});
