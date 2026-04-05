import 'server-only';
import { adminAuth, adminDb } from './admin';

export type AdminUserRow = {
  uid: string;
  email: string | null;
  name: string | null;
  videoCount: number;
  collectionCount: number;
  createdAt: string | null;
};

export async function getAdminStats() {
  const [listResult, videosSnap, collectionsSnap] = await Promise.all([
    adminAuth.listUsers(1000),
    adminDb.collection('videos').select('userId').limit(5000).get(),
    adminDb.collection('collections').select('userId').limit(5000).get(),
  ]);

  const videoCounts = new Map<string, number>();
  for (const doc of videosSnap.docs) {
    const uid = doc.data().userId as string;
    videoCounts.set(uid, (videoCounts.get(uid) ?? 0) + 1);
  }

  const collectionCounts = new Map<string, number>();
  for (const doc of collectionsSnap.docs) {
    const uid = doc.data().userId as string;
    collectionCounts.set(uid, (collectionCounts.get(uid) ?? 0) + 1);
  }

  const users: AdminUserRow[] = listResult.users.map((u) => ({
    uid: u.uid,
    email: u.email ?? null,
    name: u.displayName ?? null,
    videoCount: videoCounts.get(u.uid) ?? 0,
    collectionCount: collectionCounts.get(u.uid) ?? 0,
    createdAt: u.metadata.creationTime ?? null,
  }));

  users.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));

  return {
    users,
    totalUsers: listResult.users.length,
    totalVideos: videosSnap.size,
    totalCollections: collectionsSnap.size,
  };
}
