import { NextResponse } from 'next/server';
import { getSessionUser, isAdmin, adminDb } from '@/lib/firebase/admin';

export async function GET(_req: Request, { params }: { params: Promise<{ uid: string }> }) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.uid)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { uid } = await params;

  const [videosSnap, collectionsSnap] = await Promise.all([
    adminDb
      .collection('videos')
      .where('userId', '==', uid)
      .select('title', 'thumbnail', 'youtubeId')
      .get(),
    adminDb
      .collection('collections')
      .where('userId', '==', uid)
      .select('name', 'description', 'videoIds')
      .get(),
  ]);

  const videos = videosSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title as string,
      thumbnail: data.thumbnail as string,
      youtubeId: data.youtubeId as string,
    };
  });

  const collections = collectionsSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name as string,
      description: data.description as string,
      videoCount: (data.videoIds as string[]).length,
    };
  });

  return NextResponse.json({ videos, collections });
}
