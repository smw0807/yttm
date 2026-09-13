import { getTranslations } from 'next-intl/server';
import { getOnboardingMetrics } from '@/lib/onboarding/metrics';

export async function OnboardingMetrics() {
  const t = await getTranslations('onboarding');
  let counts: number[];
  try {
    counts = await getOnboardingMetrics();
  } catch {
    return (
      <p role="status" className="mb-8 text-sm text-muted-foreground">
        {t('metricsUnavailable')}
      </p>
    );
  }
  const labels = ['funnelStarted', 'videoTitle', 'memoTitle', 'seekTitle'] as const;
  return (
    <section className="mb-8 rounded-lg border bg-card p-5" aria-label={t('funnelTitle')}>
      <h2 className="font-semibold">{t('funnelTitle')}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{t('funnelDescription')}</p>
      <ol className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {labels.map((label, index) => (
          <li key={label}>
            <p className="text-sm text-muted-foreground">{t(label)}</p>
            <p className="text-2xl font-bold">{counts[index].toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {counts[0] > 0 ? `${Math.round((counts[index] / counts[0]) * 100)}%` : '—'}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
