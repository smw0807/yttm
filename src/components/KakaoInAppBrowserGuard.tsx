'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export function KakaoInAppBrowserGuard() {
  const t = useTranslations('kakaoGuard');
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (!ua.includes('kakaotalk')) return;

    const currentUrl = window.location.href;

    if (ua.includes('android')) {
      // Android → Chrome intent로 자동 리다이렉트
      const { host, pathname, search } = window.location;
      window.location.href = `intent://${host}${pathname}${search}#Intent;scheme=https;package=com.android.chrome;end`;
    } else if (ua.includes('iphone') || ua.includes('ipad')) {
      // iOS → 자동 리다이렉트 불가, 안내 배너 표시
      setShowIosGuide(true);
    }
  }, []);

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 미지원 시 fallback
      const el = document.createElement('textarea');
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

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
          onClick={handleCopyUrl}
          className="w-full rounded-lg bg-yellow-400 py-3 text-sm font-semibold text-black transition-colors hover:bg-yellow-300 active:bg-yellow-500"
        >
          {copied ? t('copied') : t('copyUrl')}
        </button>
      </div>
    </div>
  );
}
