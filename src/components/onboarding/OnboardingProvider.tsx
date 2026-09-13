'use client';

import { createContext, useContext, useState, useSyncExternalStore } from 'react';
import { createOnboardingStore } from '@/lib/onboarding/store';

const OnboardingContext = createContext<ReturnType<typeof createOnboardingStore> | null>(null);

export function OnboardingProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const [store] = useState(() => createOnboardingStore(userId));
  return <OnboardingContext.Provider value={store}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const store = useContext(OnboardingContext);
  if (!store) throw new Error('OnboardingProvider is required');
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return { ...store, ...state };
}
