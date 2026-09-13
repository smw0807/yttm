import { expect, test } from '@playwright/test';
import {
  adminPage,
  baseURL,
  db,
  emulatorGoogleLogin,
  guestLogin,
  localizedPath,
  messages,
  prepareBrowser,
  resetEmulators,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await resetEmulators();
  await prepareBrowser(page);
});

for (const identity of ['google', 'guest'] as const) {
  test(`${identity} cannot read admin data and confirmation returns to dashboard`, async ({
    page,
    browser,
  }, testInfo) => {
    const locale = testInfo.project.name === 'mobile' ? 'en' : 'ko';
    const m = messages(locale);
    const uid =
      identity === 'google'
        ? await emulatorGoogleLogin(page, locale)
        : await guestLogin(page, locale);
    const cookieBefore = (await page.context().cookies()).find(
      (cookie) => cookie.name === '__session',
    );
    const admin = await adminPage(browser);
    try {
      await db.collection('videos').doc('admin-only-video').set({
        userId: 'e2e-admin',
        title: 'Admin-only fixture',
        thumbnail: '/favicon.ico',
        youtubeId: 'M7lc1UVf-VE',
      });
      // Positive control: the same API really has data and still works for ADMIN_UID.
      const allowed = await admin.context().request.get(`${baseURL}/api/admin/users/e2e-admin`);
      expect(allowed.status()).toBe(200);
      expect((await allowed.json()).videos).toEqual([
        expect.objectContaining({ id: 'admin-only-video', title: 'Admin-only fixture' }),
      ]);

      for (const target of [uid, 'e2e-admin', 'unknown-user']) {
        const denied = await page.context().request.get(`${baseURL}/api/admin/users/${target}`);
        expect(denied.status()).toBe(403);
        expect(await denied.json()).toEqual({ error: 'Forbidden' });
      }

      const response = await page.goto(localizedPath(locale, '/admin'));
      const dialog = page.getByRole('dialog');
      await expect(
        dialog.getByRole('heading', { name: m.admin.accessDenied.title, exact: true }),
      ).toBeVisible();
      await expect(
        dialog.getByText(m.admin.accessDenied.description, { exact: true }),
      ).toBeVisible();
      await expect(page.getByRole('table')).toHaveCount(0);
      await expect(page.getByRole('region', { name: m.onboarding.funnelTitle })).toHaveCount(0);
      // Check the HTML response too: hiding private data only in the UI is insufficient.
      expect(await response!.text()).not.toContain('admin@example.test');
      await dialog.getByRole('button', { name: m.admin.accessDenied.confirm, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${localizedPath(locale, '/dashboard')}$`));
      await expect(
        page.getByRole('heading', { name: m.dashboard.title, exact: true }),
      ).toBeVisible();
      expect(
        (await page.context().cookies()).find((cookie) => cookie.name === '__session'),
      ).toEqual(cookieBefore);
    } finally {
      await admin.context().close();
    }
  });
}

test('signed-out requests cannot read admin data', async ({ page }, testInfo) => {
  const locale = testInfo.project.name === 'mobile' ? 'en' : 'ko';
  const response = await page.context().request.get(`${baseURL}/api/admin/users/e2e-admin`);
  expect(response.status()).toBe(403);
  expect(await response.json()).toEqual({ error: 'Forbidden' });
  await page.goto(`/${locale}/admin`);
  await expect(page).toHaveURL(new RegExp(`${localizedPath(locale, '/login')}$`));
  await expect(page.getByRole('table')).toHaveCount(0);
});
