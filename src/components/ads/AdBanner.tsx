'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface Props {
  slot: string;
  format?: 'auto' | 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

export function AdBanner({ slot, format = 'auto', className }: Props) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense 스크립트 미로드 시 무시
    }
  }, [client]);

  // Publisher ID 미설정 시 개발용 플레이스홀더 표시
  if (!client) {
    return (
      <div
        className={`bg-muted/50 border-muted flex items-center justify-center rounded-lg border border-dashed ${className}`}
      >
        <p className="text-muted-foreground text-xs">광고 영역 (AdSense 미설정)</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
