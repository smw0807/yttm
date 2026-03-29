import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/firebase/admin';
import { LoginClient } from './LoginClient';

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect('/dashboard');

  return <LoginClient />;
}
