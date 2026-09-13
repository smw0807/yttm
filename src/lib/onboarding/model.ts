export const ONBOARDING_EVENTS = ['video_added', 'memo_created', 'timeline_used'] as const;
export type OnboardingEventName = (typeof ONBOARDING_EVENTS)[number];
export type OnboardingEvent =
  | { event: 'video_added'; videoId: string }
  | { event: 'memo_created' | 'timeline_used'; videoId: string; memoId: string };
export type MetricsCommand =
  | { action: 'enable' }
  | { action: 'disable' }
  | ({ action: 'event' } & OnboardingEvent);

export function eventStep(event: OnboardingEventName): number {
  return ONBOARDING_EVENTS.indexOf(event) + 1;
}

export function funnelStep(events: Partial<Record<OnboardingEventName, boolean>>): number {
  const missing = ONBOARDING_EVENTS.findIndex((event) => events[event] !== true);
  return missing === -1 ? ONBOARDING_EVENTS.length : missing;
}

function isDocumentId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(value);
}

export function parseMetricsCommand(value: unknown): MetricsCommand | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (data.action === 'enable' || data.action === 'disable') {
    return Object.keys(data).length === 1 ? { action: data.action } : null;
  }
  if (data.action !== 'event' || !isDocumentId(data.videoId)) return null;
  if (data.event === 'video_added' && Object.keys(data).length === 3) {
    return { action: 'event', event: data.event, videoId: data.videoId };
  }
  if (
    (data.event === 'memo_created' || data.event === 'timeline_used') &&
    isDocumentId(data.memoId) &&
    Object.keys(data).length === 4
  ) {
    return { action: 'event', event: data.event, videoId: data.videoId, memoId: data.memoId };
  }
  return null;
}
