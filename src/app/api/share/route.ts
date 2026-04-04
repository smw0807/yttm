import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSessionUser } from '@/lib/firebase/admin';
import { getVideoAdmin, updateVideoShareTokenAdmin } from '@/lib/firebase/admin-firestore';

function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // Allow requests without Origin (non-browser / server-to-server)
  const host = request.headers.get('host');
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isValidOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { videoId } = await request.json();
  if (!videoId) return NextResponse.json({ error: 'videoId is required' }, { status: 400 });

  const video = await getVideoAdmin(videoId);
  if (!video || video.userId !== user.uid) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const token = uuidv4();
  await updateVideoShareTokenAdmin(videoId, token);
  return NextResponse.json({ token });
}

export async function DELETE(request: NextRequest) {
  if (!isValidOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { videoId } = await request.json();
  if (!videoId) return NextResponse.json({ error: 'videoId is required' }, { status: 400 });

  const video = await getVideoAdmin(videoId);
  if (!video || video.userId !== user.uid) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await updateVideoShareTokenAdmin(videoId, null);
  return NextResponse.json({ success: true });
}
