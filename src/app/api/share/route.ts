import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { updateVideoShareToken } from '@/lib/firebase/firestore';
import { getSessionUser } from '@/lib/firebase/admin';
import { getVideoAdmin } from '@/lib/firebase/admin-firestore';

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { videoId } = await request.json();
  if (!videoId) return NextResponse.json({ error: 'videoId is required' }, { status: 400 });

  const video = await getVideoAdmin(videoId);
  if (!video || video.userId !== user.uid) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const token = uuidv4();
  await updateVideoShareToken(videoId, token);
  return NextResponse.json({ token });
}

export async function DELETE(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { videoId } = await request.json();
  if (!videoId) return NextResponse.json({ error: 'videoId is required' }, { status: 400 });

  const video = await getVideoAdmin(videoId);
  if (!video || video.userId !== user.uid) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await updateVideoShareToken(videoId, null);
  return NextResponse.json({ success: true });
}
