import { test, expect } from '@playwright/test';
import { addVideo, db, guestLogin, prepareBrowser, resetEmulators, saveMemo } from './helpers';

test('real YouTube iframe plays and a captured memo returns to the scene', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  await resetEmulators();
  await prepareBrowser(page, true);
  await guestLogin(page, 'en');
  const videoId = await addVideo(page, 'en');
  const frame = page.frameLocator('iframe[src*="youtube.com/embed/"]');
  await expect(frame.locator('video')).toBeAttached({ timeout: 45000 });
  await frame.getByRole('button', { name: 'Play video', exact: true }).click();
  await expect
    .poll(
      async () => frame.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime),
      { timeout: 30000 },
    )
    .toBeGreaterThan(1);
  await saveMemo(page, 'en', 'Live playback memo');
  const memos = await db.collection('videos').doc(videoId).collection('memos').get();
  const captured = memos.docs[0].data().timestampSec as number;
  await expect
    .poll(async () =>
      frame.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime),
    )
    .toBeGreaterThan(captured + 3);
  await page
    .getByRole('button', { name: /^Seek to / })
    .first()
    .click();
  await expect
    .poll(async () =>
      Math.abs(
        (await frame.locator('video').evaluate((video: HTMLVideoElement) => video.currentTime)) -
          captured,
      ),
    )
    .toBeLessThan(2);
  await page.screenshot({ path: testInfo.outputPath('live-youtube.png'), fullPage: true });
});
