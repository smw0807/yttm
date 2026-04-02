'use client';

import { useRouter } from 'next/navigation';
import { signInWithGoogle, signInAsGuest } from '@/lib/firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KakaoInAppBrowserGuard } from '@/components/KakaoInAppBrowserGuard';

export function LoginClient() {
  const router = useRouter();

  async function handleGoogleLogin() {
    try {
      await signInWithGoogle();
      router.replace('/dashboard');
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  }

  async function handleGuestLogin() {
    try {
      await signInAsGuest();
      router.replace('/dashboard');
    } catch (error) {
      console.error('게스트 로그인 실패:', error);
    }
  }

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <KakaoInAppBrowserGuard />
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-2xl font-bold text-white">
            ▶
          </div>
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>
            Google 계정으로 로그인하고
            <br />
            타임라인 메모를 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="outline" className="w-full gap-3 text-base" onClick={handleGoogleLogin}>
            <GoogleIcon />
            Google로 계속하기
          </Button>
          <Button
            variant="ghost"
            className="w-full bg-gray-100 text-base hover:bg-gray-200"
            onClick={handleGuestLogin}
          >
            게스트로 시작하기
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
