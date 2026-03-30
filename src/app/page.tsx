import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex max-w-2xl flex-col items-center gap-8 text-center">
        {/* Logo / Title */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-3xl font-bold text-white shadow-lg">
            ▶
          </div>
          <h1 className="text-4xl font-bold tracking-tight">YouTube Timeline Memo</h1>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-xl leading-relaxed">
          유튜브 강의 보다가 중요한 부분,{' '}
          <span className="text-foreground font-semibold">링크 하나로 바로 돌아가기</span>
        </p>

        {/* Features */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              icon: '▶',
              title: '타임라인 메모',
              desc: '영상 재생 중 현재 시각 기준으로 메모를 저장하고, 클릭 한 번으로 해당 시점으로 즉시 이동',
            },
            {
              icon: '🔗',
              title: '공유 링크',
              desc: '공유 링크를 생성해 로그인 없이도 누구와든 타임라인 메모를 공유',
            },
            {
              icon: '📁',
              title: '컬렉션',
              desc: '관련 영상들을 컬렉션으로 묶어 주제별·시리즈별로 체계적으로 관리',
            },
            {
              icon: '🔒',
              title: '내 영상만',
              desc: 'Google 로그인으로 내 메모와 컬렉션을 안전하게 보관',
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
