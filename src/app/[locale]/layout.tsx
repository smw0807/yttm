import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';

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
    '유튜브 강의·게임 공략 영상의 중요한 장면에 타임스탬프 메모를 남기고, 클릭 한 번으로 해당 시점으로 즉시 이동하는 서비스. 컬렉션으로 관련 영상을 묶어 관리하고, 공유 링크로 타임라인을 공유하세요.',
  keywords: [
    '유튜브 타임스탬프',
    '유튜브 메모',
    '유튜브 강의 메모',
    '유튜브 공부',
    '게임 공략 메모',
    '유튜브 북마크',
    '타임라인 메모',
    '유튜브 컬렉션',
    'YouTube timestamp memo',
    'YouTube study memo',
    'YouTube bookmark',
  ],
  authors: [{ name: '송민우' }],
  openGraph: {
    type: 'website',
    url: baseUrl,
    siteName: 'YouTube Timeline Memo',
    title: 'YouTube Timeline Memo',
    description:
      '유튜브 강의·게임 공략 영상의 중요한 장면에 메모를 남기고, 클릭 한 번으로 즉시 이동. 컬렉션으로 영상 묶기 + 공유 링크 제공.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Timeline Memo',
    description:
      '유튜브 강의·게임 공략 영상의 중요한 장면에 메모를 남기고, 클릭 한 번으로 즉시 이동. 컬렉션으로 영상 묶기 + 공유 링크 제공.',
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

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
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
