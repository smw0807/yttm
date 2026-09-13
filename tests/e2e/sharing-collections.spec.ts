import { test, expect, type Page } from '@playwright/test';
import {
  addVideo,
  db,
  guestLogin,
  localizedPath,
  messages,
  prepareBrowser,
  resetEmulators,
  saveMemo,
  video,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await resetEmulators();
  await prepareBrowser(page);
});

async function assertFitsViewport(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  const dialog = page.getByRole('dialog');
  if (await dialog.isVisible()) {
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
}

test('share creation, anonymous read-only viewing, revocation, and regeneration', async ({
  page,
  browser,
}, testInfo) => {
  const locale = testInfo.project.name === 'mobile' ? 'en' : 'ko';
  const m = messages(locale);
  await guestLogin(page, locale);
  const videoId = await addVideo(page, locale);
  const memo = 'E2E share lifecycle memo';
  await saveMemo(page, locale, memo);
  await page.getByRole('button', { name: m.viewer.share, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: m.shareDialog.createLink, exact: true }).click();
  await expect(dialog.getByRole('textbox')).toHaveValue(/\/share\/[\w-]+$/);
  const shareUrl = await dialog.getByRole('textbox').inputValue();
  const originalToken = new URL(shareUrl).pathname.split('/').pop();
  expect((await db.collection('videos').doc(videoId).get()).data()?.shareToken).toBe(originalToken);
  await assertFitsViewport(page);
  await page.screenshot({ path: testInfo.outputPath('share-dialog.png'), fullPage: true });

  const anonymous = await browser.newContext({ viewport: page.viewportSize()! });
  try {
    const viewer = await anonymous.newPage();
    await prepareBrowser(viewer);
    await viewer.goto(shareUrl);
    await expect(viewer.getByText(memo, { exact: true })).toBeVisible();
    await expect(viewer.getByRole('textbox')).toHaveCount(0);
    expect((await anonymous.cookies()).some((cookie) => cookie.name === '__session')).toBe(false);
    await assertFitsViewport(viewer);

    // Revocation must invalidate a fresh request, not merely hide the owner's textbox.
    await dialog.getByRole('button', { name: m.shareDialog.revokeLink, exact: true }).click();
    await expect(
      dialog.getByRole('button', { name: m.shareDialog.createLink, exact: true }),
    ).toBeVisible();
    expect((await db.collection('videos').doc(videoId).get()).data()?.shareToken).toBeNull();
    await viewer.reload();
    await expect(viewer.getByRole('heading', { name: '404', exact: true })).toBeVisible();
    await expect(viewer.getByText(memo, { exact: true })).not.toBeVisible();

    await dialog.getByRole('button', { name: m.shareDialog.createLink, exact: true }).click();
    await expect(dialog.getByRole('textbox')).toHaveValue(/\/share\/[\w-]+$/);
    const newUrl = await dialog.getByRole('textbox').inputValue();
    expect(newUrl).not.toBe(shareUrl);
    await viewer.goto(newUrl);
    await expect(viewer.getByText(memo, { exact: true })).toBeVisible();
    await viewer.goto(shareUrl);
    await expect(viewer.getByRole('heading', { name: '404', exact: true })).toBeVisible();
    expect((await db.collection('videos').doc(videoId).collection('memos').get()).size).toBe(1);
  } finally {
    await anonymous.close();
  }
});

test('failed share creation and revocation remain retryable without false success', async ({
  page,
}, testInfo) => {
  const locale = testInfo.project.name === 'mobile' ? 'en' : 'ko';
  const m = messages(locale);
  await guestLogin(page, locale);
  const videoId = await addVideo(page, locale);
  await page.getByRole('button', { name: m.viewer.share, exact: true }).click();
  const dialog = page.getByRole('dialog');
  const failOnce = () =>
    page.route(
      '**/api/share',
      (route) => route.fulfill({ status: 503, json: { error: 'test dependency unavailable' } }),
      { times: 1 },
    );
  await failOnce();
  await dialog.getByRole('button', { name: m.shareDialog.createLink, exact: true }).click();
  await expect(dialog.getByRole('alert')).toHaveText(m.shareDialog.updateError);
  await expect(dialog.getByRole('textbox')).toHaveCount(0);
  await expect(
    dialog.getByRole('button', { name: m.shareDialog.createLink, exact: true }),
  ).toBeEnabled();

  await dialog.getByRole('button', { name: m.shareDialog.createLink, exact: true }).click();
  await expect(dialog.getByRole('textbox')).toHaveValue(/\/share\/[\w-]+$/);
  await expect(dialog.getByRole('alert')).not.toBeVisible();
  const shareUrl = await dialog.getByRole('textbox').inputValue();
  await failOnce();
  await dialog.getByRole('button', { name: m.shareDialog.revokeLink, exact: true }).click();
  await expect(dialog.getByRole('alert')).toHaveText(m.shareDialog.updateError);
  await expect(dialog.getByRole('textbox')).toHaveValue(shareUrl);
  expect((await db.collection('videos').doc(videoId).get()).data()?.shareToken).toBe(
    new URL(shareUrl).pathname.split('/').pop(),
  );
  await dialog.getByRole('button', { name: m.shareDialog.revokeLink, exact: true }).click();
  await expect(
    dialog.getByRole('button', { name: m.shareDialog.createLink, exact: true }),
  ).toBeVisible();
  await expect(dialog.getByRole('alert')).not.toBeVisible();
  expect((await db.collection('videos').doc(videoId).get()).data()?.shareToken).toBeNull();
});

test('collection create, membership persistence, removal, and deletion preserve the video', async ({
  page,
}, testInfo) => {
  const locale = testInfo.project.name === 'mobile' ? 'en' : 'ko';
  const m = messages(locale);
  const uid = await guestLogin(page, locale);
  const videoId = await addVideo(page, locale);
  await page.goto(localizedPath(locale, '/collections'));
  await page.getByRole('button', { name: m.collections.addCollection, exact: true }).click();
  const dialog = page.getByRole('dialog');
  const name = 'E2E collection';
  await dialog.getByPlaceholder(m.addCollectionDialog.namePlaceholder).fill(name);
  await dialog.getByPlaceholder(m.addCollectionDialog.descPlaceholder).fill('E2E description');
  await dialog
    .getByRole('button', { name: m.addCollectionDialog.createButton, exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole('heading', { name, exact: true }).click();
  await dialog.getByRole('button', { name: m.collectionDetail.addAction, exact: true }).click();
  const collections = await db.collection('collections').where('userId', '==', uid).get();
  expect(collections.size).toBe(1);
  const ref = collections.docs[0].ref;
  await expect.poll(async () => (await ref.get()).data()?.videoIds).toEqual([videoId]);
  await assertFitsViewport(page);
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await page.reload();
  await page.getByRole('heading', { name, exact: true }).click();
  await expect(dialog.getByRole('link', { name: new RegExp(video.title) })).toBeVisible();
  await dialog.getByRole('button', { name: m.collectionDetail.removeAction, exact: true }).click();
  await expect.poll(async () => (await ref.get()).data()?.videoIds).toEqual([]);
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await page.reload();
  await page.getByRole('heading', { name, exact: true }).click();
  await expect(
    dialog.getByRole('button', { name: m.collectionDetail.removeAction, exact: true }),
  ).toHaveCount(0);
  await dialog.getByRole('button', { name: m.collectionDetail.addAction, exact: true }).click();
  await expect.poll(async () => (await ref.get()).data()?.videoIds).toEqual([videoId]);
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByText(m.collections.videoCount.replace('{count}', '1'), { exact: true }),
  ).toBeVisible();
  const remove = page.getByRole('button', { name: m.collections.confirmDeleteTitle, exact: true });
  if (testInfo.project.name === 'mobile') await expect(remove).toHaveCSS('opacity', '1');
  await page.screenshot({ path: testInfo.outputPath('collection-card.png'), fullPage: true });
  await remove.click();
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect((await ref.get()).exists).toBe(true);
  await remove.click();
  await dialog.getByRole('button', { name: m.collections.confirmDeleteTitle, exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect.poll(async () => (await ref.get()).exists).toBe(false);
  await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0);
  expect((await db.collection('videos').doc(videoId).get()).exists).toBe(true);
  await assertFitsViewport(page);
});
