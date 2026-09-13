import { eventStep, type MetricsCommand, type OnboardingEvent } from './model';

export interface OnboardingState {
  step: number;
  dismissed: boolean;
  consent: boolean;
}
const initialState: OnboardingState = { step: 0, dismissed: false, consent: false };

export function createOnboardingStore(uid: string) {
  const key = `yttm:onboarding:v1:${uid}`;
  const listeners = new Set<() => void>();
  const sent = new Set<string>();
  let state = initialState;
  let lastRaw: string | null | undefined;
  let memoryOnly = false;
  let queue = Promise.resolve();
  let preferenceVersion = 0;

  function getSnapshot() {
    if (memoryOnly) return state;
    try {
      const raw = localStorage.getItem(key);
      if (raw !== lastRaw) {
        lastRaw = raw;
        let parsed: unknown;
        try {
          parsed = raw ? JSON.parse(raw) : null;
        } catch {
          state = initialState;
          return state;
        }
        const data =
          parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
        state = {
          step:
            typeof data.step === 'number' &&
            Number.isInteger(data.step) &&
            data.step >= 0 &&
            data.step <= 3
              ? data.step
              : 0,
          dismissed: data.dismissed === true,
          consent: data.consent === true,
        };
      }
    } catch {
      // Storage may be blocked; the in-memory guide still works.
    }
    return state;
  }

  function update(patch: Partial<OnboardingState>) {
    state = { ...getSnapshot(), ...patch };
    try {
      lastRaw = JSON.stringify(state);
      localStorage.setItem(key, lastRaw);
    } catch {
      // No storage permission is required for the guide.
      memoryOnly = true;
    }
    listeners.forEach((listener) => listener());
  }

  function enqueue(work: () => Promise<void>) {
    const pending = queue.then(work);
    queue = pending.catch(() => {});
    return pending;
  }

  async function request(command: MetricsCommand) {
    const response = await fetch('/api/onboarding', {
      method: 'POST',
      credentials: 'same-origin',
      signal: AbortSignal.timeout(5000),
      headers: { 'Content-Type': 'application/json', 'X-Onboarding-User': uid },
      body: JSON.stringify(command),
    });
    if (response.status === 409) {
      // Consent may have been withdrawn on a different device.
      sent.clear();
      update({ consent: false });
    }
    if (!response.ok) throw new Error('Metrics request failed');
  }

  return {
    getSnapshot,
    getServerSnapshot: () => initialState,
    subscribe(listener: () => void) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) {
          sent.clear();
          listener();
        }
      };
      window.addEventListener('storage', onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', onStorage);
      };
    },
    dismiss: () => update({ dismissed: true }),
    reopen: () => update({ dismissed: false }),
    track(event: OnboardingEvent) {
      update({ step: Math.max(getSnapshot().step, eventStep(event.event)) });
      if (!getSnapshot().consent) return;
      void enqueue(async () => {
        if (!getSnapshot().consent || sent.has(event.event)) return;
        await request({ action: 'event', ...event });
        sent.add(event.event);
      }).catch(() => {}); // Analytics must never fail a video/memo action.
    },
    async setConsent(enabled: boolean) {
      const version = ++preferenceVersion;
      // Stop sending immediately, even if deletion needs a retry.
      if (!enabled) update({ consent: false });
      await enqueue(async () => {
        await request({ action: enabled ? 'enable' : 'disable' });
        sent.clear();
        if (version === preferenceVersion) update({ consent: enabled });
      });
    },
  };
}
