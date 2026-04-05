import { notFound } from 'next/navigation';
import { getSessionUser, isAdmin } from '@/lib/firebase/admin';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.uid)) notFound();
  return <>{children}</>;
}
