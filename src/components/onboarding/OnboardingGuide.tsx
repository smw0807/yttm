'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { useOnboarding } from './OnboardingProvider';

export function OnboardingGuide({
  onAddVideo,
  videoId,
  hasMemos = false,
}: {
  onAddVideo?: () => void;
  videoId?: string;
  hasMemos?: boolean;
}) {
  const t = useTranslations('onboarding');
  const { step, dismissed, dismiss, reopen } = useOnboarding();
  const visibleStep = Math.max(step, hasMemos ? 2 : videoId ? 1 : 0);
  if (dismissed) {
    return (
      <Button variant="ghost" size="sm" onClick={reopen}>
        {t('reopen')}
      </Button>
    );
  }
  return (
    <section aria-label={t('title')} className="mb-6 rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{t('title')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={dismiss}>
          {t('dismiss')}
        </Button>
      </div>
      <ol className="my-4 grid gap-3 text-sm sm:grid-cols-3">
        {(['video', 'memo', 'seek'] as const).map((name, index) => (
          <li
            key={name}
            aria-current={visibleStep === index ? 'step' : undefined}
            className={
              visibleStep === index
                ? 'rounded-lg border border-primary p-3'
                : 'rounded-lg border p-3'
            }
          >
            <span className="font-medium">
              {index < visibleStep ? '✓' : `${index + 1}.`} {t(`${name}Title`)}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">{t(`${name}Description`)}</p>
          </li>
        ))}
      </ol>
      {visibleStep === 3 && (
        <p role="status" className="text-sm font-medium text-primary">
          {t('completed')}
        </p>
      )}
      {onAddVideo && !videoId && <Button onClick={onAddVideo}>{t('addVideo')}</Button>}
      {onAddVideo && videoId && (
        <Link
          href={`/videos/${videoId}`}
          className="text-sm font-medium text-primary underline underline-offset-4"
        >
          {t('openVideo')}
        </Link>
      )}
    </section>
  );
}
