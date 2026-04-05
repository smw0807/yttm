import { getTranslations } from 'next-intl/server';
import { getAdminStats } from '@/lib/firebase/admin-stats';
import { UserDetailRow } from '@/components/admin/UserDetailRow';

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

  const rowLabels = {
    registeredVideos: t('registeredVideos'),
    registeredCollections: t('registeredCollections'),
    noVideos: t('noVideos'),
    noCollections: t('noCollections'),
    loading: t('loading'),
    videoCountTemplate: t('videoCountTemplate'),
  };

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard label={t('totalUsers')} value={totalUsers} />
        <StatCard label={t('totalVideos')} value={totalVideos} />
        <StatCard label={t('totalCollections')} value={totalCollections} />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">{t('email')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('name')}</th>
              <th className="px-4 py-3 text-right font-medium">{t('videos')}</th>
              <th className="px-4 py-3 text-right font-medium">{t('collections')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('joined')}</th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <UserDetailRow key={u.uid} user={u} labels={rowLabels} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
