import Link from 'next/link';
import { UserMenu } from '@/components/UserMenu';

const navLink =
  'inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium transition-colors hover:bg-muted';

interface Props {
  displayName: string;
}

export function Header({ displayName }: Props) {
  return (
    <header className="bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-xs text-white">
            ▶
          </span>
          YT Timeline Memo
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/dashboard" className={navLink}>
            대시보드
          </Link>
          <Link href="/collections" className={navLink}>
            컬렉션
          </Link>
          <UserMenu displayName={displayName} />
        </nav>
      </div>
    </header>
  );
}
