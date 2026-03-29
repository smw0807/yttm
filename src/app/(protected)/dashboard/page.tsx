import { getSessionUser } from '@/lib/firebase/admin';
import { getVideosAdmin } from '@/lib/firebase/admin-firestore';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default async function DashboardPage() {
  const user = await getSessionUser();
  const videos = await getVideosAdmin(user!.uid);

  return <DashboardContent initialVideos={videos} userId={user!.uid} />;
}
