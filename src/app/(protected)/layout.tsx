import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/firebase/admin';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen flex-col">
      <Header displayName={user.name ?? user.email ?? ''} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
