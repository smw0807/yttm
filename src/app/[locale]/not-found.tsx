import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import yttmIcon from '@/app/public/yttm.png';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Image
        src={yttmIcon}
        alt="YT Timeline Memo"
        width={64}
        height={64}
        className="rounded-2xl shadow-lg"
      />
      <h1 className="mt-6 text-6xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground mt-3 text-lg">{t('message')}</p>
      <p className="text-muted-foreground mt-1 text-sm">{t('detail')}</p>
      <Link
        href="/dashboard"
        className="bg-primary text-primary-foreground hover:bg-primary/80 mt-8 inline-flex h-10 items-center rounded-lg px-6 text-sm font-medium transition-colors"
      >
        {t('backToDashboard')}
      </Link>
    </main>
  );
}
