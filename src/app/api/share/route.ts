import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { updateVideoShareToken } from '@/lib/firebase/firestore';

export async function POST(request: NextRequest) {
  const { videoId } = await request.json();

  if (!videoId) {
    return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
  }

  const token = uuidv4();
  await updateVideoShareToken(videoId, token);

  return NextResponse.json({ token });
}

export async function DELETE(request: NextRequest) {
  const { videoId } = await request.json();

  if (!videoId) {
    return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
  }

  await updateVideoShareToken(videoId, null);

  return NextResponse.json({ success: true });
}
