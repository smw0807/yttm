import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, expect, it, vi } from 'vitest';
import ko from '../../messages/ko.json';
import en from '../../messages/en.json';

const state = vi.hoisted(() => ({
  step: 0,
  dismissed: false,
  consent: false,
  dismiss: vi.fn(),
  reopen: vi.fn(),
  setConsent: vi.fn(),
}));
vi.mock('@/components/onboarding/OnboardingProvider', () => ({ useOnboarding: () => state }));
vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => createElement('a', { href, className }, children),
}));
import { OnboardingGuide } from '@/components/onboarding/OnboardingGuide';
import { MetricsPreference } from '@/components/onboarding/MetricsPreference';

function render(node: ReactNode, locale: 'ko' | 'en' = 'ko') {
  return renderToStaticMarkup(
    createElement(NextIntlClientProvider, {
      locale,
      messages: locale === 'ko' ? ko : en,
      timeZone: 'UTC',
      children: node,
    }),
  );
}
beforeEach(() => {
  state.step = 0;
  state.dismissed = false;
  state.consent = false;
});

it.each(['ko', 'en'] as const)(
  'renders the three-step guide and opt-in settings in %s',
  (locale) => {
    const messages = locale === 'ko' ? ko : en;
    const html = render(createElement(OnboardingGuide, { onAddVideo: vi.fn() }), locale);
    expect(html).toContain(messages.onboarding.title);
    expect(html).toContain(messages.onboarding.videoTitle);
    expect(html).toContain(messages.onboarding.memoTitle);
    expect(html).toContain(messages.onboarding.seekTitle);
    expect(html).toContain('aria-current="step"');
    const settings = render(createElement(MetricsPreference), locale);
    expect(settings).toContain(messages.onboarding.metricsDisabled);
    expect(settings).toContain(messages.onboarding.metricsEnable);
    expect(settings).not.toContain('checked');
  },
);
it('links to an existing video and acknowledges existing memos without emitting metrics', () => {
  const html = render(
    createElement(OnboardingGuide, {
      onAddVideo: vi.fn(),
      videoId: 'video-doc',
      hasMemos: true,
    }),
  );
  expect(html).toContain('href="/videos/video-doc"');
  expect((html.match(/✓/g) ?? []).length).toBe(2);
});
it('allows dismissed guides to be reopened and renders completion', () => {
  state.dismissed = true;
  expect(render(createElement(OnboardingGuide))).toContain(ko.onboarding.reopen);
  state.dismissed = false;
  state.step = 3;
  expect(render(createElement(OnboardingGuide))).toContain(ko.onboarding.completed);
});
it('always exposes withdrawal, including when browser consent is off', () => {
  expect(render(createElement(MetricsPreference))).toContain(ko.onboarding.metricsDisable);
  state.consent = true;
  const html = render(createElement(MetricsPreference));
  expect(html).toContain(ko.onboarding.metricsEnabled);
  expect(html).toContain(ko.onboarding.metricsDisable);
  expect(html).not.toContain(ko.onboarding.metricsEnable + '<');
});
it('keeps all onboarding translation keys in sync', () => {
  expect(Object.keys(ko.onboarding).sort()).toEqual(Object.keys(en.onboarding).sort());
});
