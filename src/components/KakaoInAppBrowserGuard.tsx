'use client';

import { useTranslations } from 'next-intl';
import { useKakaoInAppBrowserGuard } from '@/hooks/useKakaoInAppBrowserGuard';

export function KakaoInAppBrowserGuard() {
  const t = useTranslations('kakaoGuard');
  const { showIosGuide, copied, copyCurrentUrl } = useKakaoInAppBrowserGuard();

  if (!showIosGuide) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/40 pb-6 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-1 text-center text-2xl">🌐</div>
        <h2 className="mb-1 text-center text-base font-bold">{t('title')}</h2>
        <p className="text-muted-foreground mb-5 text-center text-sm leading-relaxed whitespace-pre-line">
          {t('description')}
        </p>
        <button
          onClick={copyCurrentUrl}
          className="w-full rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-black transition-colors hover:bg-yellow-300 active:bg-yellow-500"
        >
          {copied ? t('copied') : t('copyUrl')}
        </button>
      </div>
    </div>
  );
}
