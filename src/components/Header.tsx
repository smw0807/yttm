"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";

const navLink =
  "inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium transition-colors hover:bg-muted";

export function Header() {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white text-xs">
            ▶
          </span>
          YT Timeline Memo
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/dashboard" className={navLink}>대시보드</Link>
          <Link href="/collections" className={navLink}>컬렉션</Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </nav>
      </div>
    </header>
  );
}
