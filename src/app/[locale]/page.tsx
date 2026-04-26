import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import yttmIcon from '@/app/public/yttm.png';
import appScreenshot from '@/app/public/screenshot.png';
import ScreenshotLightbox from '@/components/landing/ScreenshotLightbox';
import { SITE_NAME, SITE_SHORT_NAME } from '@/lib/constants';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: `${SITE_NAME} — 유튜브 강의·게임 공략 타임스탬프 메모`,
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
    name: SITE_NAME,
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

  const howToUseSteps = [
    { num: t('howToUse.step1Num'), title: t('howToUse.step1Title'), desc: t('howToUse.step1Desc') },
    { num: t('howToUse.step2Num'), title: t('howToUse.step2Title'), desc: t('howToUse.step2Desc') },
    { num: t('howToUse.step3Num'), title: t('howToUse.step3Title'), desc: t('howToUse.step3Desc') },
    { num: t('howToUse.step4Num'), title: t('howToUse.step4Title'), desc: t('howToUse.step4Desc') },
  ];

  const useCases = [
    {
      icon: t('useCases.case1Icon'),
      title: t('useCases.case1Title'),
      desc: t('useCases.case1Desc'),
    },
    {
      icon: t('useCases.case2Icon'),
      title: t('useCases.case2Title'),
      desc: t('useCases.case2Desc'),
    },
    {
      icon: t('useCases.case3Icon'),
      title: t('useCases.case3Title'),
      desc: t('useCases.case3Desc'),
    },
    {
      icon: t('useCases.case4Icon'),
      title: t('useCases.case4Title'),
      desc: t('useCases.case4Desc'),
    },
  ];

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
    { q: t('faq.q6'), a: t('faq.a6') },
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
              alt={SITE_SHORT_NAME}
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
              <div className="bg-background/70 ml-2 flex-1 rounded-md px-3 py-1 text-center text-xs">
                <a
                  href="https://www.yttm.kr/share/d541d9b6-0381-45c7-9e42-20eb198fa7b1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  yttm.kr
                </a>
              </div>
            </div>

            {/* Screenshot — click to expand */}
            <ScreenshotLightbox src={appScreenshot} alt="앱 미리보기" />
          </div>
          {/* Reflection/shadow effect */}
          <div className="mx-8 h-4 rounded-b-2xl bg-gradient-to-b from-black/5 to-transparent" />
          {/* Live demo link */}
          <div className="mt-4 text-center">
            <a
              href="https://www.yttm.kr/share/d541d9b6-0381-45c7-9e42-20eb198fa7b1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {t('liveDemo')} →
            </a>
          </div>
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

      {/* Chrome Extension Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="bg-card overflow-hidden rounded-3xl border shadow-sm">
            <div className="flex flex-col items-center gap-8 p-8 sm:p-12 lg:flex-row lg:items-start">
              {/* Icon + Badge */}
              <div className="flex shrink-0 flex-col items-center gap-3">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#4285F4]/10 text-5xl shadow-inner">
                  🧩
                </div>
                <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
                  {t('extension.badge')}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  {t('extension.sectionTitle')}
                </h2>
                <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                  {t('extension.desc')}
                </p>

                {/* Features */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {(
                    [
                      { key: 'feature1', icon: '⚡' },
                      { key: 'feature2', icon: '📝' },
                      { key: 'feature3', icon: '🔄' },
                    ] as const
                  ).map(({ key, icon }) => (
                    <div key={key} className="bg-muted/40 rounded-xl p-4 text-left">
                      <div className="mb-2 text-xl">{icon}</div>
                      <h3 className="mb-1 text-sm font-semibold">{t(`extension.${key}Title`)}</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {t(`extension.${key}Desc`)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Download Button */}
                <a
                  href="https://chromewebstore.google.com/detail/akcenlcmjliffoildhkhmpmeiebnaiak?utm_source=item-share-cb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#4285F4] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {t('extension.downloadButton')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">
            {t('howToUse.sectionTitle')}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {howToUseSteps.map(({ num, title, desc }) => (
              <div key={num} className="flex gap-4">
                <div className="text-primary shrink-0 text-4xl font-extrabold opacity-20">
                  {num}
                </div>
                <div>
                  <h3 className="mb-1 text-base font-semibold">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">
            {t('useCases.sectionTitle')}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {useCases.map(({ icon, title, desc }) => (
              <div key={title} className="bg-background rounded-2xl border p-6 text-left">
                <div className="mb-3 text-3xl">{icon}</div>
                <h3 className="mb-2 text-base font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">
            {t('faq.sectionTitle')}
          </h2>
          <div className="divide-border divide-y">
            {faqs.map(({ q, a }) => (
              <div key={q} className="py-6">
                <h3 className="mb-2 text-base font-semibold">{q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-t px-4 py-16 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">{t('ctaTitle')}</h2>
          <p className="text-muted-foreground mb-8 text-base leading-relaxed">{t('ctaDesc')}</p>
          <Link
            href="/login"
            className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-11 items-center justify-center rounded-lg px-10 text-base font-semibold transition-colors"
          >
            {t('ctaButton')} →
          </Link>
        </div>
      </section>
    </main>
  );
}
