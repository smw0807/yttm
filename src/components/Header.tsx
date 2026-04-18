'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { UserMenu } from '@/components/UserMenu';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

interface Props {
  displayName: string;
  isAnonymous: boolean;
}

export function Header({ displayName, isAnonymous }: Props) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  function navClass(href: string) {
    const active = pathname === href || pathname.startsWith(href + '/');
    return [
      'inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium transition-colors',
      active
        ? 'bg-muted text-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    ].join(' ');
  }

  return (
    <header className="bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Image src="/yttm.png" alt="YTTM" width={28} height={28} className="rounded-lg" />
          YT Timeline Memo
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/dashboard" className={navClass('/dashboard')}>
            {t('dashboard')}
          </Link>
          <Link href="/videos" className={navClass('/videos')}>
            {t('videos')}
          </Link>
          <Link href="/collections" className={navClass('/collections')}>
            {t('collections')}
          </Link>
          <a
            href="https://chromewebstore.google.com/detail/akcenlcmjliffoildhkhmpmeiebnaiak?utm_source=item-share-cb"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors"
          >
            🧩 {t('extension')}
          </a>
          <LocaleSwitcher />
          <UserMenu displayName={displayName} isAnonymous={isAnonymous} />
        </nav>
      </div>
    </header>
  );
}
