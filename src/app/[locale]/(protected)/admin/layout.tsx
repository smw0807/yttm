import { getTranslations } from 'next-intl/server';
import { AdminAccessDeniedDialog } from '@/components/admin/AdminAccessDeniedDialog';
import { getSessionUser, isAdmin } from '@/lib/firebase/admin';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user || !isAdmin(user.uid)) {
    const t = await getTranslations('admin.accessDenied');

    return (
      <AdminAccessDeniedDialog
        title={t('title')}
        description={t('description')}
        confirmLabel={t('confirm')}
      />
    );
  }

  return <>{children}</>;
}
