"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";

interface Props {
  displayName: string;
}

export function UserMenu({ displayName }: Props) {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground hidden sm:block">{displayName}</span>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        로그아웃
      </Button>
    </div>
  );
}
