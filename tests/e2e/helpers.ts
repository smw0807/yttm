import { createHash } from 'node:crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { expect, type Browser, type Page } from '@playwright/test';
import ko from '../../messages/ko.json';
import en from '../../messages/en.json';

if (
  process.env.GCLOUD_PROJECT !== 'demo-yttm-e2e' ||
  process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8086' ||
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9098'
) {
  throw new Error('E2E helpers must never access production Firebase');
}
const app = getApps()[0] ?? initializeApp({ projectId: 'demo-yttm-e2e' });
export const db = getFirestore(app);
const auth = getAuth(app);
export const baseURL = `http://localhost:${process.env.E2E_PORT ?? '3100'}`;
export const localizedPath = (locale: 'ko' | 'en', path: string) =>
  locale === 'ko' ? path : `/en${path}`;
export const video = {
  youtubeId: 'M7lc1UVf-VE',
  title: 'E2E sample video',
  thumbnail: '/favicon.ico',
  durationSec: 240,
};
export const messages = (locale: 'ko' | 'en') => (locale === 'ko' ? ko : en);

export async function resetEmulators() {
  for (const url of [
    'http://127.0.0.1:8086/emulator/v1/projects/demo-yttm-e2e/databases/(default)/documents',
    'http://127.0.0.1:9098/emulator/v1/projects/demo-yttm-e2e/accounts',
  ]) {
    const response = await fetch(url, { method: 'DELETE' });
    if (!response.ok) throw new Error('Could not reset the isolated E2E emulator');
  }
}

export async function prepareBrowser(page: Page, live = false) {
  // Never contact production Firebase or analytics. The live test permits only YouTube media.
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue();
    if (
      live &&
      /(^|\.)(youtube\.com|youtube-nocookie\.com|ytimg\.com|googlevideo\.com|gstatic\.com|google\.com)$/.test(
        url.hostname,
      )
    )
      return route.continue();
    return route.abort();
  });
  await page.route('**/api/youtube?**', (route) => route.fulfill({ json: video }));
  if (!live)
    await page.route('https://www.youtube.com/iframe_api', (route) =>
      route.fulfill({
        contentType: 'application/javascript',
        body: `window.YT = { Player: class {
      constructor(element, options) {
        this.element = element; this.time = 12;
        element.setAttribute('aria-label', 'Simulated YouTube player');
        element.style.color = 'white'; element.textContent = 'Simulated YouTube player';
        setTimeout(() => options.events.onReady({target: this}), 0);
      }
      getCurrentTime() { return this.time; }
      seekTo(seconds) { this.time = seconds; this.element.dataset.seekTime = String(seconds); }
      playVideo() { this.element.dataset.playing = 'true'; }
      destroy() { this.element.textContent = ''; }
    }}; window.onYouTubeIframeAPIReady();`,
      }),
    );
}

export async function guestLogin(page: Page, locale: 'ko' | 'en') {
  // Explicit locale sets NEXT_LOCALE even when the browser prefers another language.
  await page.goto(`/${locale}/login`);
  await page.getByRole('button', { name: messages(locale).auth.guestLogin, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${localizedPath(locale, '/dashboard')}$`));
  const cookie = (await page.context().cookies()).find((item) => item.name === '__session');
  expect(cookie?.httpOnly).toBe(true);
  const session = await auth.verifySessionCookie(cookie!.value, true);
  return session.uid;
}

export function metricRef(uid: string) {
  return db
    .collection('_onboardingMetrics')
    .doc(createHash('sha256').update(`onboarding-v1:${uid}`).digest('hex'));
}

export async function changeMetricsConsent(
  page: Page,
  locale: 'ko' | 'en',
  enabled: boolean,
  expectedStatus = 200,
) {
  const action = enabled ? 'enable' : 'disable';
  const m = messages(locale).onboarding;
  const [response] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/onboarding') &&
        response.request().method() === 'POST' &&
        response.request().postDataJSON()?.action === action,
      { timeout: 15000 },
    ),
    page
      .getByRole('button', { name: enabled ? m.metricsEnable : m.metricsDisable, exact: true })
      .click(),
  ]);
  // Report API failures directly instead of timing out on a missing success message.
  const detail =
    response.status() === expectedStatus
      ? ''
      : await response.text().catch(() => '(response body unavailable)');
  expect(response.status(), `Metrics ${action} response: ${detail}`).toBe(expectedStatus);
}

export async function addVideo(page: Page, locale: 'ko' | 'en') {
  const m = messages(locale);
  await page.getByRole('button', { name: m.dashboard.addVideo, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox').fill(`https://www.youtube.com/watch?v=${video.youtubeId}`);
  const response = page.waitForResponse(
    (res) => res.url().endsWith('/api/videos') && res.request().method() === 'POST',
  );
  await dialog.getByRole('button', { name: m.addVideoDialog.addButton, exact: true }).click();
  const result = await response;
  expect(result.status()).toBe(200);
  const { id } = await result.json();
  await expect(dialog).not.toBeVisible();
  await page.getByRole('link', { name: m.onboarding.openVideo, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/videos/${id}$`));
  return id as string;
}

export async function saveMemo(page: Page, locale: 'ko' | 'en', content = 'E2E private memo') {
  const m = messages(locale);
  await page.getByRole('button', { name: m.memoForm.captureTime, exact: true }).click();
  await page.getByPlaceholder(m.memoForm.placeholder).fill(content);
  await page.getByRole('button', { name: m.memoForm.saveButton, exact: true }).click();
  await expect(page.getByPlaceholder(m.memoForm.placeholder)).toHaveValue('');
  await expect(page.getByText(content, { exact: true })).toBeVisible();
}

export async function adminPage(browser: Browser) {
  // Test-only admin fixture, using the real emulator token -> app session-cookie endpoint.
  await auth.createUser({
    uid: 'e2e-admin',
    email: 'admin@example.test',
    password: 'emulator-only-password',
  });
  const response = await fetch(
    'http://127.0.0.1:9098/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-not-a-real-api-key',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.test',
        password: 'emulator-only-password',
        returnSecureToken: true,
      }),
    },
  );
  const { idToken } = await response.json();
  expect(typeof idToken).toBe('string');
  const context = await browser.newContext();
  const session = await context.request.post(`${baseURL}/api/auth/session`, {
    headers: { origin: baseURL, host: new URL(baseURL).host },
    data: { idToken },
  });
  expect(session.ok()).toBe(true);
  const page = await context.newPage();
  await prepareBrowser(page);
  await page.goto(`${baseURL}/en/admin`);
  return page;
}
