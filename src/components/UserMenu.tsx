'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { logout, upgradeGuestToGoogle } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';

interface Props {
  displayName: string;
  isAnonymous: boolean;
}

export function UserMenu({ displayName, isAnonymous }: Props) {
  const router = useRouter();
  const t = useTranslations('auth');

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  async function handleUpgrade() {
    try {
      await upgradeGuestToGoogle();
      router.refresh();
    } catch (error) {
      console.error('계정 연결 실패:', error);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {isAnonymous ? (
        <>
          <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-medium">
            {t('guest')}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={handleUpgrade}
          >
            {t('connectGoogle')}
          </Button>
        </>
      ) : (
        <span className="text-muted-foreground hidden text-sm sm:block">{displayName}</span>
      )}
      <Button variant="outline" size="sm" onClick={handleLogout}>
        {t('logout')}
      </Button>
    </div>
  );
}
