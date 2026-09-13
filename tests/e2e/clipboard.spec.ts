import { test, expect } from '@playwright/test';
import { addVideo, guestLogin, messages, prepareBrowser, resetEmulators } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetEmulators();
  await prepareBrowser(page);
});

for (const mode of ['denied', 'unavailable'] as const) {
  test(`clipboard ${mode} provides manual selection and a successful retry`, async ({
    page,
  }, testInfo) => {
    const locale = testInfo.project.name === 'mobile' ? 'en' : 'ko';
    const m = messages(locale);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    // Mock only the clipboard boundary. Never read or overwrite the user's OS clipboard.
    await page.addInitScript((mode) => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value:
          mode === 'unavailable'
            ? undefined
            : {
                writeText: async () => {
                  throw new DOMException('Test-only denial', 'NotAllowedError');
                },
              },
      });
    }, mode);
    await guestLogin(page, locale);
    await addVideo(page, locale);
    await page.getByRole('button', { name: m.viewer.share, exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: m.shareDialog.createLink, exact: true }).click();
    const input = dialog.getByRole('textbox', { name: m.shareDialog.title, exact: true });
    await expect(input).toHaveValue(/\/share\/[\w-]+$/);
    const url = await input.inputValue();
    const copy = dialog.getByRole('button', { name: m.shareDialog.copy, exact: true });
    await copy.click();
    await expect(dialog.getByRole('alert')).toHaveText(m.shareDialog.copyError);
    await expect(
      dialog.getByRole('button', { name: m.shareDialog.copied, exact: true }),
    ).toHaveCount(0);
    await expect(input).toBeFocused();
    expect(
      await input.evaluate((element: HTMLInputElement) =>
        element.value.slice(element.selectionStart ?? 0, element.selectionEnd ?? 0),
      ),
    ).toBe(url);
    await expect(input).toHaveValue(url);
    await expect(copy).toBeEnabled();

    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            document.documentElement.dataset.testCopiedLink = text;
          },
        },
      });
    });
    await copy.click();
    await expect(
      dialog.getByRole('button', { name: m.shareDialog.copied, exact: true }),
    ).toBeVisible();
    await expect(dialog.getByRole('alert')).not.toBeVisible();
    expect(await page.evaluate(() => document.documentElement.dataset.testCopiedLink)).toBe(url);
    await expect(copy).toBeVisible();
    expect(errors).toEqual([]);
  });
}
