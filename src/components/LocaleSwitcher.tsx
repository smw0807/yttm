'use client';

import { useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function LocaleSwitcher() {
  const t = useTranslations('localeSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = e.target.value as (typeof routing.locales)[number];
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <select
      value={locale}
      onChange={handleChange}
      disabled={isPending}
      className="text-muted-foreground hover:text-foreground bg-transparent text-xs font-medium outline-none cursor-pointer disabled:opacity-50"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {t(loc)}
        </option>
      ))}
    </select>
  );
}
