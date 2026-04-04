import { notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/firebase/admin';
import { getVideosAdmin, getCollectionsAdmin } from '@/lib/firebase/admin-firestore';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) notFound();

  const [videos, collections] = await Promise.all([
    getVideosAdmin(user.uid),
    getCollectionsAdmin(user.uid),
  ]);

  return <DashboardContent initialVideos={videos} initialCollections={collections} userId={user.uid} />;
}
