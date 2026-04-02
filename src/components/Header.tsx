'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from '@/components/UserMenu';

interface Props {
  displayName: string;
  isAnonymous: boolean;
}

export function Header({ displayName, isAnonymous }: Props) {
  const pathname = usePathname();

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
            대시보드
          </Link>
          <Link href="/videos" className={navClass('/videos')}>
            내 영상
          </Link>
          <Link href="/collections" className={navClass('/collections')}>
            컬렉션
          </Link>
          <UserMenu displayName={displayName} isAnonymous={isAnonymous} />
        </nav>
      </div>
    </header>
  );
}
