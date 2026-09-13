'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { useOnboarding } from './OnboardingProvider';

export function MetricsPreference() {
  const t = useTranslations('onboarding');
  const { consent, setConsent } = useOnboarding();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function change(enabled: boolean) {
    setPending(true);
    setError(false);
    setDeleted(false);
    try {
      await setConsent(enabled);
      setDeleted(!enabled);
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-label={t('metricsTitle')} className="mt-8 border-t pt-4 text-sm">
      <h2 className="font-medium">{t('metricsTitle')}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{t('metricsDescription')}</p>
      <p className="mt-2 text-xs" role="status">
        {consent ? t('metricsEnabled') : t('metricsDisabled')}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!consent && (
          <Button variant="outline" size="sm" disabled={pending} onClick={() => void change(true)}>
            {t('metricsEnable')}
          </Button>
        )}
        <Button variant="ghost" size="sm" disabled={pending} onClick={() => void change(false)}>
          {t('metricsDisable')}
        </Button>
        <Link href="/privacy" className="text-xs underline">
          {t('privacy')}
        </Link>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {t('metricsError')}
        </p>
      )}
      {deleted && (
        <p role="status" className="mt-2 text-xs">
          {t('metricsDeleted')}
        </p>
      )}
    </section>
  );
}
