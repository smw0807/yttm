import { getSessionUser } from '@/lib/firebase/admin';
import { getCollectionsAdmin, getVideosAdmin } from '@/lib/firebase/admin-firestore';
import { CollectionsContent } from '@/components/collections/CollectionsContent';

export default async function CollectionsPage() {
  const user = await getSessionUser();
  const [collections, videos] = await Promise.all([
    getCollectionsAdmin(user!.uid),
    getVideosAdmin(user!.uid),
  ]);

  return <CollectionsContent initialCollections={collections} videos={videos} userId={user!.uid} />;
}
