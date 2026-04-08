import { getTranslations } from 'next-intl/server';
import { getAdminStats } from '@/lib/firebase/admin-stats';
import { UsersTable } from '@/components/admin/UsersTable';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}

export default async function AdminPage() {
  const t = await getTranslations('admin');
  const { users, totalUsers, totalVideos, totalCollections } = await getAdminStats();

  const tableLabels = {
    email: t('email'),
    name: t('name'),
    videos: t('videos'),
    collections: t('collections'),
    joined: t('joined'),
    registeredVideos: t('registeredVideos'),
    registeredCollections: t('registeredCollections'),
    noVideos: t('noVideos'),
    noCollections: t('noCollections'),
    loading: t('loading'),
    videoCountTemplate: t.raw('videoCountTemplate') as string,
  };

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard label={t('totalUsers')} value={totalUsers} />
        <StatCard label={t('totalVideos')} value={totalVideos} />
        <StatCard label={t('totalCollections')} value={totalCollections} />
      </div>

      <UsersTable users={users} labels={tableLabels} />
    </div>
  );
}
