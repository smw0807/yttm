import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  const { guestUid, idToken } = await request.json();
  if (!guestUid || !idToken) {
    return NextResponse.json({ error: 'guestUid and idToken are required' }, { status: 400 });
  }

  let newUid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    newUid = decoded.uid;
  } catch {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 });
  }

  if (newUid === guestUid) {
    return NextResponse.json({ success: true, message: 'same uid, no migration needed' });
  }

  try {
    const batch = adminDb.batch();

    const videosSnap = await adminDb.collection('videos').where('userId', '==', guestUid).get();
    videosSnap.docs.forEach((d) => batch.update(d.ref, { userId: newUid }));

    const colsSnap = await adminDb
      .collection('collections')
      .where('userId', '==', guestUid)
      .get();
    colsSnap.docs.forEach((d) => batch.update(d.ref, { userId: newUid }));

    await batch.commit();

    return NextResponse.json({ success: true, migrated: videosSnap.size + colsSnap.size });
  } catch {
    return NextResponse.json({ error: '데이터 이관 실패' }, { status: 500 });
  }
}
