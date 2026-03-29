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
        <ul className="text-muted-foreground flex flex-col gap-3 text-left">
          {[
            '영상 재생 중 현재 시각 기준으로 메모 저장',
            '저장된 메모 클릭 → 해당 시점으로 즉시 이동',
            '공유 링크로 타임라인 메모를 누구와도 공유',
          ].map((text) => (
            <li key={text} className="flex items-start gap-2">
              <span className="mt-1 text-green-500">✓</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>

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
