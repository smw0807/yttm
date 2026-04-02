import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import yttmIcon from '@/app/public/yttm.png';

export const metadata: Metadata = {
  title: 'YouTube Timeline Memo — 유튜브 강의·게임 공략 타임스탬프 메모',
  description:
    '유튜브 강의나 게임 공략 영상의 중요한 장면에 타임스탬프 메모를 남기세요. 클릭 한 번으로 해당 시점으로 즉시 이동하고, 컬렉션으로 주제별 영상을 묶어 관리할 수 있습니다. 로그인 없이 게스트로 바로 체험 가능.',
};

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
  featureList: [
    '유튜브 강의·게임 공략 영상 타임스탬프 메모',
    '메모 클릭으로 영상 시점 즉시 이동',
    '컬렉션으로 주제별·시리즈별 영상 관리',
    '공유 링크 생성 (로그인 불필요)',
    '게스트 모드 — 회원가입 없이 바로 체험',
    'Google 계정 연동',
  ],
};

export default function LandingPage() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex max-w-2xl flex-col items-center gap-8 text-center">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-3">
          <Image src={yttmIcon} alt="YT Timeline Memo" width={64} height={64} className="rounded-2xl shadow-lg" />
          <h1 className="text-4xl font-bold tracking-tight">YouTube Timeline Memo</h1>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-xl leading-relaxed">
          유튜브 강의·게임 공략, 중요한 장면에 메모 남기고{' '}
          <span className="text-foreground font-semibold">클릭 한 번으로 바로 돌아가기</span>
        </p>

        {/* Features */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              icon: '▶',
              title: '타임라인 메모',
              desc: '강의·공략 영상 재생 중 현재 시각으로 메모를 저장하고, 클릭 한 번으로 해당 시점으로 즉시 이동',
            },
            {
              icon: '📁',
              title: '컬렉션',
              desc: '"React 강의 모음", "게임 공략" 처럼 영상을 주제별·시리즈별로 묶어 체계적으로 관리',
            },
            {
              icon: '🔗',
              title: '공유 링크',
              desc: '공유 링크를 생성해 로그인 없이도 누구와든 타임라인 메모를 공유',
            },
            {
              icon: '👤',
              title: '게스트 모드',
              desc: '회원가입 없이 바로 체험. 나중에 Google 계정으로 연결하면 작성한 메모가 그대로 유지',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-muted/50 rounded-xl p-4 text-left">
              <div className="mb-2 text-2xl">{icon}</div>
              <h3 className="mb-1 font-semibold">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/login"
          className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-10 items-center justify-center rounded-lg px-8 text-base font-medium transition-colors"
        >
          시작하기
        </Link>
      </div>
    </main>
  );
}
