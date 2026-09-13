import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOnboardingStore } from '@/lib/onboarding/store';
import { funnelStep, parseMetricsCommand } from '@/lib/onboarding/model';

const fetchMock = vi.fn();
let storage: Map<string, string>;
beforeEach(() => {
  storage = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  fetchMock.mockReset().mockResolvedValue(Response.json({ ok: true }));
  vi.stubGlobal('fetch', fetchMock);
});

describe('onboarding progress and consent', () => {
  it('works without consent and does not transmit any events', () => {
    const store = createOnboardingStore('owner');
    store.track({ event: 'memo_created', videoId: 'video', memoId: 'memo' });
    expect(store.getSnapshot()).toEqual({ step: 2, dismissed: false, consent: false });
    store.dismiss();
    expect(createOnboardingStore('owner').getSnapshot().dismissed).toBe(true);
    store.reopen();
    expect(store.getSnapshot().dismissed).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('isolates accounts and keeps SSR snapshots stable and private', () => {
    const owner = createOnboardingStore('owner');
    owner.track({ event: 'timeline_used', videoId: 'video', memoId: 'memo' });
    expect(createOnboardingStore('other').getSnapshot().step).toBe(0);
    expect(owner.getServerSnapshot().step).toBe(0);
    expect(owner.getServerSnapshot()).toBe(owner.getServerSnapshot());
    expect(owner.getSnapshot()).toBe(owner.getSnapshot());
  });
  it('survives corrupt or unwritable storage', () => {
    storage.set('yttm:onboarding:v1:owner', '{bad');
    const store = createOnboardingStore('owner');
    expect(store.getSnapshot().step).toBe(0);
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('Blocked');
      },
    });
    store.track({ event: 'video_added', videoId: 'video' });
    expect(store.getSnapshot().step).toBe(1);
  });
  it('sends only after successful opt-in and deduplicates repeated events', async () => {
    const store = createOnboardingStore('owner');
    await store.setConsent(true);
    store.track({ event: 'video_added', videoId: 'video' });
    store.track({ event: 'video_added', videoId: 'video' });
    store.track({ event: 'memo_created', videoId: 'video', memoId: 'memo' });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(fetchMock.mock.calls.map(([, options]) => JSON.parse(options.body))).toEqual([
      { action: 'enable' },
      { action: 'event', event: 'video_added', videoId: 'video' },
      { action: 'event', event: 'memo_created', videoId: 'video', memoId: 'memo' },
    ]);
    expect(fetchMock.mock.calls[0][1].headers['X-Onboarding-User']).toBe('owner');
  });
  it('does not opt in when the server fails', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    const store = createOnboardingStore('owner');
    await expect(store.setConsent(true)).rejects.toThrow();
    expect(store.getSnapshot().consent).toBe(false);
  });
  it('keeps a newer withdrawal local even if an earlier enable finishes late', async () => {
    let resolveEnable!: (response: Response) => void;
    fetchMock.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveEnable = resolve;
      }),
    );
    const store = createOnboardingStore('owner');
    const enable = store.setConsent(true);
    const disable = store.setConsent(false);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    fetchMock.mockRejectedValueOnce(new Error('deletion offline'));
    const result = expect(disable).rejects.toThrow();
    resolveEnable(Response.json({ ok: true }));
    await enable;
    await result;
    expect(store.getSnapshot().consent).toBe(false);
  });
  it('stops sending when the server reports withdrawal from another device', async () => {
    const store = createOnboardingStore('owner');
    await store.setConsent(true);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 409 }));
    store.track({ event: 'video_added', videoId: 'video' });
    await vi.waitFor(() => expect(store.getSnapshot().consent).toBe(false));
    store.track({ event: 'memo_created', videoId: 'video', memoId: 'memo' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('fails closed if persisted consent becomes corrupt', async () => {
    const store = createOnboardingStore('owner');
    await store.setConsent(true);
    storage.set('yttm:onboarding:v1:owner', '{bad');
    expect(store.getSnapshot().consent).toBe(false);
  });
  it('stops immediately on withdrawal even when server deletion fails, and allows retry', async () => {
    const store = createOnboardingStore('owner');
    await store.setConsent(true);
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    await expect(store.setConsent(false)).rejects.toThrow();
    expect(store.getSnapshot().consent).toBe(false);
    store.track({ event: 'video_added', videoId: 'video' });
    await store.setConsent(false);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
  it('does not throw from product actions when metrics fail', async () => {
    const store = createOnboardingStore('owner');
    await store.setConsent(true);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }));
    expect(() => store.track({ event: 'video_added', videoId: 'video' })).not.toThrow();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(store.getSnapshot().step).toBe(1);
    await store.setConsent(false);
  });
  it('removes storage listeners and responds to cross-tab changes', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.stubGlobal('window', { addEventListener, removeEventListener });
    const store = createOnboardingStore('owner');
    const notify = vi.fn();
    const unsubscribe = store.subscribe(notify);
    storage.set(
      'yttm:onboarding:v1:owner',
      JSON.stringify({ step: 3, dismissed: true, consent: false }),
    );
    addEventListener.mock.calls[0][1]({ key: 'yttm:onboarding:v1:owner' });
    expect(notify).toHaveBeenCalledOnce();
    expect(store.getSnapshot().step).toBe(3);
    unsubscribe();
    expect(removeEventListener).toHaveBeenCalledWith('storage', addEventListener.mock.calls[0][1]);
  });
});

describe('metrics input and funnel', () => {
  it.each([
    null,
    [],
    { action: 'enable', uid: 'other' },
    { action: 'unknown' },
    { action: 'event', event: 'video_added', videoId: '../other' },
    { action: 'event', event: 'memo_created', videoId: 'video' },
    { action: 'event', event: 'video_added', videoId: 'video', content: 'private memo' },
  ])('rejects malformed or extra fields: %j', (value) => {
    expect(parseMetricsCommand(value)).toBeNull();
  });
  it('accepts only the supported commands', () => {
    for (const command of [
      { action: 'enable' },
      { action: 'disable' },
      { action: 'event', event: 'video_added', videoId: 'video' },
      { action: 'event', event: 'memo_created', videoId: 'video', memoId: 'memo' },
      { action: 'event', event: 'timeline_used', videoId: 'video', memoId: 'memo' },
    ])
      expect(parseMetricsCommand(command)).toEqual(command);
  });
  it('requires all preceding milestones, even when events arrive out of order', () => {
    expect(funnelStep({ timeline_used: true })).toBe(0);
    expect(funnelStep({ video_added: true, timeline_used: true })).toBe(1);
    expect(funnelStep({ video_added: true, memo_created: true })).toBe(2);
    expect(funnelStep({ video_added: true, memo_created: true, timeline_used: true })).toBe(3);
  });
});
