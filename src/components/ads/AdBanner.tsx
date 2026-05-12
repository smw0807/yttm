'use client';

import Script from 'next/script';

interface Props {
  unit?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function AdBanner({ unit, width = 728, height = 90, className }: Props) {
  const adUnit = unit ?? process.env.NEXT_PUBLIC_ADFIT_UNIT;

  if (!adUnit) return null;

  return (
    <div className={className}>
      <ins
        className="kakao_ad_area"
        style={{ display: 'none' }}
        data-ad-unit={adUnit}
        data-ad-width={String(width)}
        data-ad-height={String(height)}
      />
      <Script src="//t1.kakaocdn.net/kas/static/ba.min.js" strategy="afterInteractive" />
    </div>
  );
}
