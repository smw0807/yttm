import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import yttmIcon from '@/app/public/yttm.png';

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
    <main className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex max-w-2xl flex-col items-center gap-8 text-center">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src={yttmIcon}
            alt="YT Timeline Memo"
            width={64}
            height={64}
            className="rounded-2xl shadow-lg"
          />
          <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-xl leading-relaxed">
          {t.rich('description', {
            highlight: (chunks) => (
              <span className="text-foreground font-semibold">{chunks}</span>
            ),
          })}
        </p>

        {/* Features */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map(({ icon, key }) => (
            <div key={key} className="bg-muted/50 rounded-xl p-4 text-left">
              <div className="mb-2 text-2xl">{icon}</div>
              <h3 className="mb-1 font-semibold">{t(`features.${key}.title`)}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(`features.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/login"
          className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-10 items-center justify-center rounded-lg px-8 text-base font-medium transition-colors"
        >
          {t('startButton')}
        </Link>
      </div>
    </main>
  );
}
