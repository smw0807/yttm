import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, getSessionUser } from '@/lib/firebase/admin';
import { isValidOrigin } from '@/lib/api/validation';

const MIGRATION_BATCH_SIZE = 450;

export async function POST(request: NextRequest) {
  if (!isValidOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const guest = await getSessionUser();
  if (!guest || !guest.isAnonymous) {
    return NextResponse.json({ error: 'Anonymous session required' }, { status: 401 });
  }

  let idToken: unknown;
  try {
    ({ idToken } = (await request.json()) as { idToken?: unknown });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof idToken !== 'string' || !idToken) {
    return NextResponse.json({ error: 'idToken is required' }, { status: 400 });
  }

  let targetUid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    if (decoded.firebase?.sign_in_provider !== 'google.com') {
      return NextResponse.json({ error: 'Google account required' }, { status: 403 });
    }
    targetUid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }

  if (targetUid === guest.uid) {
    return NextResponse.json({ success: true, message: 'same uid, no migration needed' });
  }

  try {
    const [videosSnap, collectionsSnap] = await Promise.all([
      adminDb.collection('videos').where('userId', '==', guest.uid).get(),
      adminDb.collection('collections').where('userId', '==', guest.uid).get(),
    ]);

    const documents = [...videosSnap.docs, ...collectionsSnap.docs];
    for (let offset = 0; offset < documents.length; offset += MIGRATION_BATCH_SIZE) {
      const batch = adminDb.batch();
      documents
        .slice(offset, offset + MIGRATION_BATCH_SIZE)
        .forEach((document) => batch.update(document.ref, { userId: targetUid }));
      await batch.commit();
    }

    return NextResponse.json({ success: true, migrated: documents.length });
  } catch (error) {
    console.error('[auth/migrate] Migration failed', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
