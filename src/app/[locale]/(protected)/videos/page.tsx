import { notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/firebase/admin';
import { getVideosAdmin } from '@/lib/firebase/admin-firestore';
import { VideosContent } from '@/components/videos/VideosContent';

export default async function VideosPage() {
  const user = await getSessionUser();
  if (!user) notFound();

  const videos = await getVideosAdmin(user.uid);

  return <VideosContent initialVideos={videos} userId={user.uid} />;
}
