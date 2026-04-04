import { notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/firebase/admin';
import { getVideoAdmin, getMemosAdmin } from '@/lib/firebase/admin-firestore';
import { VideoViewerClient } from '@/components/player/VideoViewerClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VideoViewerPage({ params }: Props) {
  const { id } = await params;
  const user = await getSessionUser();

  const [video, memos] = await Promise.all([getVideoAdmin(id), getMemosAdmin(id)]);

  if (!video || video.userId !== user!.uid) notFound();

  return <VideoViewerClient video={video} videoId={id} initialMemos={memos} />;
}
