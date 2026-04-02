import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://yttm.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'YouTube Timeline Memo',
    template: '%s | YT Timeline Memo',
  },
  description:
    '유튜브 영상을 시청하며 타임스탬프 메모를 남기고, 클릭 한 번으로 해당 장면으로 바로 돌아가는 서비스. 컬렉션으로 관련 영상을 묶고 공유 링크로 타임라인을 공유하세요.',
  keywords: [
    '유튜브 타임스탬프',
    '유튜브 메모',
    '유튜브 공부',
    '타임라인 메모',
    '유튜브 북마크',
    'YouTube timestamp memo',
    'YouTube bookmark',
  ],
  authors: [{ name: '송민우' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: baseUrl,
    siteName: 'YouTube Timeline Memo',
    title: 'YouTube Timeline Memo',
    description:
      '유튜브 강의 보다가 중요한 부분, 링크 하나로 바로 돌아가기. 타임스탬프 메모 + 컬렉션 + 공유 링크.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Timeline Memo',
    description:
      '유튜브 강의 보다가 중요한 부분, 링크 하나로 바로 돌아가기. 타임스탬프 메모 + 컬렉션 + 공유 링크.',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    other: {
      'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ?? '',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
    </html>
  );
}
