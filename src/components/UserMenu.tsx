'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { logout, upgradeGuestToGoogle } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { getGuestUpgradeErrorKey } from '@/lib/firebase/auth-errors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  displayName: string;
  isAnonymous: boolean;
}

export function UserMenu({ displayName, isAnonymous }: Props) {
  const router = useRouter();
  const t = useTranslations('auth');
  const connecting = useRef(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [upgradeError, setUpgradeError] = useState<ReturnType<
    typeof getGuestUpgradeErrorKey
  > | null>(null);

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  async function handleUpgrade() {
    if (connecting.current) return;
    connecting.current = true;
    setIsConnecting(true);
    setUpgradeError(null);
    try {
      await upgradeGuestToGoogle();
      router.refresh();
    } catch (error) {
      // Do not log Firebase errors: they may contain reusable OAuth credentials.
      setUpgradeError(getGuestUpgradeErrorKey(error));
    } finally {
      connecting.current = false;
      setIsConnecting(false);
    }
  }

  return (
    <div className="flex max-w-full flex-wrap items-center gap-2 lg:flex-nowrap lg:gap-3">
      {isAnonymous ? (
        <>
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {t('guest')}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-500 text-white hover:bg-blue-600"
            onClick={handleUpgrade}
            disabled={isConnecting}
            aria-busy={isConnecting}
          >
            {t(isConnecting ? 'connectingGoogle' : 'connectGoogle')}
          </Button>
        </>
      ) : (
        <span className="hidden text-sm text-muted-foreground sm:block">{displayName}</span>
      )}
      <Button variant="outline" size="sm" onClick={handleLogout} disabled={isConnecting}>
        {t('logout')}
      </Button>
      <Dialog
        open={upgradeError !== null}
        onOpenChange={(open) => {
          if (!open) setUpgradeError(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t('connectErrorTitle')}</DialogTitle>
            <DialogDescription>{upgradeError ? t(upgradeError) : null}</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('connectRetryHint')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeError(null)}>
              {t('connectDismiss')}
            </Button>
            <Button onClick={handleUpgrade} disabled={isConnecting}>
              {t('connectRetry')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
