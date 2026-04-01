import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-3xl font-bold text-white shadow-lg">
        ▶
      </div>
      <h1 className="mt-6 text-6xl font-bold tracking-tight">404</h1>
      <p className="text-muted-foreground mt-3 text-lg">페이지를 찾을 수 없습니다.</p>
      <p className="text-muted-foreground mt-1 text-sm">
        주소가 잘못되었거나 삭제된 페이지입니다.
      </p>
      <Link
        href="/dashboard"
        className="bg-primary text-primary-foreground hover:bg-primary/80 mt-8 inline-flex h-10 items-center rounded-lg px-6 text-sm font-medium transition-colors"
      >
        대시보드로 돌아가기
      </Link>
    </main>
  );
}
