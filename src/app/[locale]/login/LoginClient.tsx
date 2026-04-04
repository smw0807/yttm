'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { signInWithGoogle, signInAsGuest } from '@/lib/firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KakaoInAppBrowserGuard } from '@/components/KakaoInAppBrowserGuard';

export function LoginClient() {
  const router = useRouter();
  const t = useTranslations('auth');
  const [loading, setLoading] = useState<'google' | 'guest' | null>(null);

  async function handleGoogleLogin() {
    if (loading) return;
    setLoading('google');
    try {
      await signInWithGoogle();
      router.replace('/dashboard');
    } catch (error) {
      console.error('로그인 실패:', error);
      setLoading(null);
    }
  }

  async function handleGuestLogin() {
    if (loading) return;
    setLoading('guest');
    try {
      await signInAsGuest();
      router.replace('/dashboard');
    } catch (error) {
      console.error('게스트 로그인 실패:', error);
      setLoading(null);
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
          <CardTitle className="text-2xl">{t('login')}</CardTitle>
          <CardDescription>
            {t('loginDescription')
              .split('\n')
              .map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full gap-3 text-base"
            onClick={handleGoogleLogin}
            disabled={!!loading}
          >
            {loading === 'google' ? <Spinner /> : <GoogleIcon />}
            {t('googleLogin')}
          </Button>
          <Button
            variant="ghost"
            className="w-full bg-gray-100 text-base hover:bg-gray-200"
            onClick={handleGuestLogin}
            disabled={!!loading}
          >
            {loading === 'guest' && <Spinner />}
            {loading === 'guest' ? t('loggingIn') : t('guestLogin')}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
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
