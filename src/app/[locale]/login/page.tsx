import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getSessionUser } from '@/lib/firebase/admin';
import { LoginClient } from './LoginClient';

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    const locale = await getLocale();
    redirect(`/${locale}/dashboard`);
  }

  return <LoginClient />;
}
