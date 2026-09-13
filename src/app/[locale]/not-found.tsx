import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import yttmIcon from '@/app/public/yttm.png';
import { SITE_SHORT_NAME } from '@/lib/constants';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Image
        src={yttmIcon}
        alt={SITE_SHORT_NAME}
        width={64}
        height={64}
        className="rounded-2xl shadow-lg"
      />
      <h1 className="mt-6 text-6xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{t('message')}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t('detail')}</p>
      <Link
        href="/dashboard"
        className="mt-8 inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        {t('backToDashboard')}
      </Link>
    </main>
  );
}
