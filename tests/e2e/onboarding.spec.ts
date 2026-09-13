import { test, expect } from '@playwright/test';
import {
  addVideo,
  adminPage,
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
  }, testInfo) => {
    const locale = testInfo.project.name === 'mobile' ? 'en' : 'ko';
    const m = messages(locale);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
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
    await page.reload();
    await page.getByRole('button', { name: m.onboarding.reopen, exact: true }).click();
    await expect(page.getByRole('heading', { name: m.onboarding.title })).toBeVisible();
    if (consent) {
      await page.getByRole('button', { name: m.onboarding.metricsEnable, exact: true }).click();
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
    await page.reload();
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
        await page.getByRole('button', { name: m.onboarding.metricsDisable, exact: true }).click();
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
    await page.goto(localizedPath(locale, '/dashboard'));
    await expect(page).toHaveURL(new RegExp(`${localizedPath(locale, '/login')}$`));
    expect(errors).toEqual([]);
  });
}
