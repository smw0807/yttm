import { test, expect } from '@playwright/test';
import { guestLogin, messages, prepareBrowser, resetEmulators } from './helpers';

test('unavailable OAuth initialization shows a localized retry dialog without losing the guest', async ({
  page,
}, testInfo) => {
  await resetEmulators();
  await prepareBrowser(page);
  // prepareBrowser blocks the Google API loader, before Firebase opens a popup.
  // This tests real failure/retry UI; popup-specific codes are covered by unit tests.
  const locale = testInfo.project.name === 'mobile' ? 'en' : 'ko';
  const m = messages(locale);
  await guestLogin(page, locale);
  const before = (await page.context().cookies()).find(
    (cookie) => cookie.name === '__session',
  )?.value;
  const writes: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && /\/api\/auth\/(session|migrate)$/.test(request.url()))
      writes.push(request.url());
  });
  await page.getByRole('button', { name: m.auth.connectGoogle, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: m.auth.connectErrorTitle })).toBeVisible();
  await expect(dialog.getByText(m.auth.connectFailed)).toBeVisible();
  await expect(dialog.getByText(m.auth.connectRetryHint)).toBeVisible();
  await dialog.getByRole('button', { name: m.auth.connectRetry, exact: true }).click();
  await expect(dialog.getByText(m.auth.connectFailed)).toBeVisible();
  await dialog.getByRole('button', { name: m.auth.connectDismiss, exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: m.auth.connectGoogle, exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: m.auth.logout, exact: true })).toBeEnabled();
  expect(
    (await page.context().cookies()).find((cookie) => cookie.name === '__session')?.value,
  ).toBe(before);
  expect(writes).toEqual([]);
});
