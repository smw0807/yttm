import { test, expect } from '@playwright/test';
import {
  addVideo,
  adminPage,
  changeMetricsConsent,
  db,
  guestLogin,
  localizedPath,
  messages,
  metricRef,
  prepareBrowser,
  resetEmulators,
  saveMemo,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await resetEmulators();
  await prepareBrowser(page);
});

for (const consent of [false, true]) {
  test(`guest onboarding, persistence, and consent=${consent}`, async ({
    page,
    browser,
    browserName,
  }, testInfo) => {
    const locale = testInfo.project.name === 'mobile' ? 'en' : 'ko';
    const m = messages(locale);
    const errors: string[] = [];
    let reloading = false;
    page.on('pageerror', (error) => {
      // WebKit reports cancelled emulator long-poll XHRs as access-control errors
      // during a full reload. Keep this exception confined to that operation and
      // those two local transports; all other page errors still fail the test.
      if (
        browserName === 'webkit' &&
        reloading &&
        /127\.0\.0\.1:8086\/google\.firestore\.v1\.Firestore\/(Listen|Write)\/channel\?.* due to access control checks\.$/.test(
          error.message,
        )
      ) {
        testInfo.annotations.push({
          type: 'webkit-emulator-reload',
          description: 'Local Firestore long-poll request cancelled during reload',
        });
        return;
      }
      errors.push(error.message);
    });
    async function reloadPage() {
      reloading = true;
      try {
        await page.reload();
      } finally {
        reloading = false;
      }
    }
    let metricRequests = 0;
    page.on('request', (request) => {
      if (request.url().endsWith('/api/onboarding')) metricRequests++;
    });
    const uid = await guestLogin(page, locale);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await expect(page.getByText(m.onboarding.metricsDisabled, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: m.onboarding.dismiss, exact: true }).click();
    await reloadPage();
    await page.getByRole('button', { name: m.onboarding.reopen, exact: true }).click();
    await expect(page.getByRole('heading', { name: m.onboarding.title })).toBeVisible();
    if (consent) {
      await changeMetricsConsent(page, locale, true);
      await expect(page.getByText(m.onboarding.metricsEnabled, { exact: true })).toBeVisible();
    }
    const videoId = await addVideo(page, locale);
    await expect(page.getByLabel('Simulated YouTube player')).toBeVisible();
    await saveMemo(page, locale);
    await page
      .getByRole('button', { name: m.memoList.seekToTime.replace('{time}', '0:12'), exact: true })
      .click();
    await expect(page.getByLabel('Simulated YouTube player')).toHaveAttribute(
      'data-seek-time',
      '12',
    );
    await expect(page.getByText(m.onboarding.completed, { exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('viewer.png'), fullPage: true });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await reloadPage();
    await expect(page.getByText('E2E private memo', { exact: true })).toBeVisible();
    const memoDocs = await db.collection('videos').doc(videoId).collection('memos').get();
    expect(memoDocs.size).toBe(1);
    if (consent) {
      await expect.poll(async () => (await metricRef(uid).get()).data()?.step).toBe(3);
      const admin = await adminPage(browser);
      try {
        const funnel = admin.getByRole('region', { name: messages('en').onboarding.funnelTitle });
        await expect(funnel.getByText('100%', { exact: true })).toHaveCount(4);
        await page.goto(localizedPath(locale, '/dashboard'));
        // SSR defaults to consent=false. The persisted true state proves that the
        // client store has hydrated before we interact after a full navigation.
        await expect(page.getByText(m.onboarding.metricsEnabled, { exact: true })).toBeVisible();
        await changeMetricsConsent(page, locale, false);
        await expect(page.getByText(m.onboarding.metricsDeleted, { exact: true })).toBeVisible();
        expect((await metricRef(uid).get()).data()).toEqual({ enabled: false });
        await admin.reload();
        await expect(funnel.getByText('—', { exact: true })).toHaveCount(4);
      } finally {
        await admin.context().close();
      }
    } else {
      expect(metricRequests).toBe(0);
      expect((await metricRef(uid).get()).exists).toBe(false);
    }
    await page.getByRole('button', { name: m.auth.logout, exact: true }).click();
    await expect
      .poll(async () =>
        (await page.context().cookies()).some((cookie) => cookie.name === '__session'),
      )
      .toBe(false);
    // Cookie deletion completes before Firebase sign-out and router.replace('/').
    // Wait for that navigation before probing a protected route (notably in WebKit).
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === localizedPath(locale, '/') || (locale === 'en' && url.pathname === '/en'),
    );
    await page.goto(localizedPath(locale, '/dashboard'));
    await expect(page).toHaveURL(new RegExp(`${localizedPath(locale, '/login')}$`));
    expect(errors).toEqual([]);
  });
}

test('failed metrics withdrawal stays retryable and never reports deletion early', async ({
  page,
}, testInfo) => {
  const locale = testInfo.project.name === 'mobile' ? 'en' : 'ko';
  const m = messages(locale).onboarding;
  const settings = page.getByRole('region', { name: m.metricsTitle, exact: true });
  const uid = await guestLogin(page, locale);
  await changeMetricsConsent(page, locale, true);
  await expect(page.getByText(m.metricsEnabled, { exact: true })).toBeVisible();

  await page.route(
    '**/api/onboarding',
    (route) => route.fulfill({ status: 503, json: { error: 'Service temporarily unavailable' } }),
    { times: 1 },
  );
  await changeMetricsConsent(page, locale, false, 503);
  await expect(settings.getByRole('alert')).toHaveText(m.metricsError);
  await expect(page.getByText(m.metricsDeleted, { exact: true })).not.toBeVisible();
  await expect(page.getByText(m.metricsDisabled, { exact: true })).toBeVisible();
  expect((await metricRef(uid).get()).data()?.enabled).toBe(true);

  // Local consent is already off, but server deletion must still be retryable.
  await changeMetricsConsent(page, locale, false);
  await expect(page.getByText(m.metricsDeleted, { exact: true })).toBeVisible();
  await expect(settings.getByRole('alert')).not.toBeVisible();
  expect((await metricRef(uid).get()).data()).toEqual({ enabled: false });
});
