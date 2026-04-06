import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import yttmIcon from '@/app/public/yttm.png';
import appScreenshot from '@/app/public/screenshot.png';
import ScreenshotLightbox from '@/components/landing/ScreenshotLightbox';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: 'YouTube Timeline Memo — 유튜브 강의·게임 공략 타임스탬프 메모',
    description:
      locale === 'ko'
        ? '유튜브 강의나 게임 공략 영상의 중요한 장면에 타임스탬프 메모를 남기세요. 클릭 한 번으로 해당 시점으로 즉시 이동하고, 컬렉션으로 주제별 영상을 묶어 관리할 수 있습니다. 로그인 없이 게스트로 바로 체험 가능.'
        : 'Leave timestamp memos on key moments in YouTube lectures and game walkthroughs. Jump to any moment with one click, organize videos by topic with collections. Try it instantly as a guest.',
    openGraph: {
      locale: locale === 'ko' ? 'ko_KR' : 'en_US',
    },
  };
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'YouTube Timeline Memo',
    description:
      '유튜브 강의·게임 공략 영상의 중요한 장면에 타임스탬프 메모를 남기고, 클릭 한 번으로 해당 시점으로 즉시 이동하는 서비스. 컬렉션으로 주제별 영상을 묶고 공유 링크로 타임라인을 공유할 수 있습니다.',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    inLanguage: 'ko',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
  };

  const features = [
    { icon: '▶', key: 'timeline' as const },
    { icon: '📁', key: 'collection' as const },
    { icon: '🔗', key: 'share' as const },
    { icon: '👤', key: 'guest' as const },
  ];

  return (
    <main className="bg-background min-h-screen overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center px-4 pt-20 pb-10 text-center">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,rgba(220,38,38,0.07),transparent)]" />

        <div className="flex w-full max-w-3xl flex-col items-center gap-6">
          {/* Logo + badge */}
          <div className="flex items-center gap-3">
            <Image
              src={yttmIcon}
              alt="YT Timeline Memo"
              width={48}
              height={48}
              className="rounded-xl shadow-md"
            />
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl">{t('title')}</h1>

          {/* Description */}
          <p className="text-muted-foreground max-w-xl text-xl leading-relaxed">
            {t.rich('description', {
              highlight: (chunks) => (
                <span className="text-foreground font-semibold">{chunks}</span>
              ),
            })}
          </p>

          {/* CTA */}
          <Link
            href="/login"
            className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-11 items-center justify-center rounded-lg px-10 text-base font-semibold transition-colors"
          >
            {t('startButton')} →
          </Link>
        </div>

        {/* Browser mockup with screenshot */}
        <div className="mt-14 w-full max-w-4xl">
          <div className="bg-card overflow-hidden rounded-2xl border shadow-2xl ring-1 ring-black/5">
            {/* Browser chrome */}
            <div className="bg-muted/60 flex items-center gap-2 border-b px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
                <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                <div className="h-3 w-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="bg-background/70 text-muted-foreground ml-2 flex-1 rounded-md px-3 py-1 text-center text-xs">
                yttm.kr
              </div>
            </div>

            {/* Screenshot — click to expand */}
            <ScreenshotLightbox src={appScreenshot} alt="앱 미리보기" />
          </div>
          {/* Reflection/shadow effect */}
          <div className="mx-8 h-4 rounded-b-2xl bg-gradient-to-b from-black/5 to-transparent" />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {features.map(({ icon, key }) => (
              <div
                key={key}
                className="bg-background hover:border-border/80 rounded-2xl border p-6 text-left transition-shadow hover:shadow-md"
              >
                <div className="mb-3 text-3xl">{icon}</div>
                <h3 className="mb-2 text-base font-semibold">{t(`features.${key}.title`)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(`features.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
