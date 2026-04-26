'use client';

import { useCallback, useEffect, useState } from 'react';

function getUserAgent() {
  if (typeof navigator === 'undefined') return '';
  return navigator.userAgent.toLowerCase();
}

function isKakaoIosInAppBrowser() {
  const ua = getUserAgent();
  return ua.includes('kakaotalk') && (ua.includes('iphone') || ua.includes('ipad'));
}

export function useKakaoInAppBrowserGuard() {
  const [showIosGuide] = useState(isKakaoIosInAppBrowser);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ua = getUserAgent();
    if (!ua.includes('kakaotalk') || !ua.includes('android')) return;

    const { host, pathname, search } = window.location;
    window.location.href = `intent://${host}${pathname}${search}#Intent;scheme=https;package=com.android.chrome;end`;
  }, []);

  const copyCurrentUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const el = document.createElement('textarea');
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return { showIosGuide, copied, copyCurrentUrl };
}
