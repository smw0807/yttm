import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/firebase/admin';
import { addVideoAdmin } from '@/lib/firebase/admin-firestore';
import { isValidOrigin } from '@/lib/api/validation';

export async function POST(request: NextRequest) {
  if (!isValidOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { youtubeId, title, thumbnail, durationSec } = body;

  if (!youtubeId || !title) {
    return NextResponse.json({ error: 'youtubeId and title are required' }, { status: 400 });
  }

  const id = await addVideoAdmin({ youtubeId, title, thumbnail, durationSec, userId: user.uid });
  return NextResponse.json({ id });
}
