import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
async function route(page: Page, path = '') {
  await page.goto(`./#/${path}`);
  await expect(page.locator('main h1')).toBeVisible();
}
async function saveRoom(page: Page) {
  await route(page, 'lab');
  await page.getByRole('button', { name: 'Save room', exact: true }).click();
  await expect(page).toHaveURL(/#\/lab\/[a-f0-9-]+$/);
  await expect(page.getByText('Saved locally', { exact: true })).toBeVisible();
}
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('editorial pages, filters, deep links and credits work', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await route(page);
  await expect(page.getByRole('heading', { name: /SPACE\s*TO\s*BE\./ })).toBeVisible();
  await page.getByRole('link', { name: 'Explore the studies', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Spatial studies.' })).toBeVisible();
  await page.getByRole('button', { name: /^Living/ }).click();
  await expect(page.locator('.work-item')).toHaveCount(2);
  await expect(page).toHaveURL(/type=Living/);
  await page.getByRole('button', { name: 'List view', exact: true }).click();
  await page.reload();
  await expect(page.locator('.work-list .work-item')).toHaveCount(2);
  await page.locator('.work-item').first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'A pause between.' })).toBeVisible();
  await expect(page.getByText('Unbuilt / fictional')).toBeVisible();
  await page.getByRole('link', { name: 'Explore this material in the lab' }).click();
  await expect(page.getByRole('heading', { name: 'Room to rearrange.' })).toBeVisible();
  await route(page, 'studio#credits');
  await expect(page.locator('#credits')).toBeInViewport();
  await expect(page.locator('.credit-list a')).toHaveCount(6);
  expect(errors).toEqual([]);
});

test('material pairing carries into the room editor', async ({ page }) => {
  await route(page, 'materials');
  await page.getByRole('button', { name: 'Fine terrazzo', exact: true }).click();
  await page.getByRole('button', { name: 'Sage', exact: true }).click();
  await page.getByRole('link', { name: 'Try this pairing in a room' }).click();
  await expect(page.getByRole('button', { name: 'Fine terrazzo', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Sage tone' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('saved room changes, history and object controls survive reload', async ({ page }) => {
  await saveRoom(page);
  await page.getByRole('button', { name: 'Pale limestone', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pale limestone', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Undo last change' }).click();
  await expect(page.getByRole('button', { name: 'Warm oak', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Redo last change' }).click();
  await expect(page.getByRole('button', { name: 'Pale limestone', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Rename room' }).click();
  await page.getByLabel('Room name', { exact: true }).fill('A quiet Sunday');
  await page.getByRole('button', { name: 'Keep this name' }).click();
  await expect(page.getByRole('heading', { name: 'A quiet Sunday', exact: true })).toBeVisible();
  const sofa = page.getByRole('button', { name: /^Sofa, X/ });
  await sofa.focus();
  await sofa.press('ArrowRight');
  await expect(sofa).toHaveAttribute('aria-label', /X 1\.6/);
  await page.getByRole('button', { name: 'Move selected object left' }).click();
  await expect(sofa).toHaveAttribute('aria-label', /X 1\.5/);
  await page.getByLabel('Add an object').selectOption('plant');
  await expect(page.locator('.object-list > button')).toHaveCount(8);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'A quiet Sunday', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pale limestone', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('.object-list > button')).toHaveCount(8);
});

test('invalid boundary moves and rotations preserve the room', async ({ page }) => {
  await route(page, 'lab?preset=empty');
  await page.getByLabel('Add an object').selectOption('sofa');
  const sofa = page.getByRole('button', { name: /^Sofa, X/ });
  const label = await sofa.getAttribute('aria-label');
  await sofa.focus();
  await sofa.press('Shift+ArrowLeft');
  await expect(page.getByRole('alert')).toContainText('outside');
  await expect(sofa).toHaveAttribute('aria-label', label!);
  await page.getByRole('button', { name: 'Rotate 90°' }).click();
  await expect(sofa).toHaveAttribute('aria-label', label!);
  await expect(page.getByRole('alert')).toContainText('outside');
});

test('pointer dragging commits snapped positions', async ({ page, isMobile }) => {
  test.skip(
    isMobile,
    'Mobile uses the touch-friendly position controls covered by the editor flow.',
  );
  await route(page, 'lab?preset=empty');
  await page.getByLabel('Add an object').selectOption('chair');
  const chair = page.getByRole('button', { name: /^Lounge chair, X/ });
  await chair.scrollIntoViewIfNeeded();
  const box = await chair.boundingBox();
  const plan = await page.locator('.editor-canvas .floor-plan').boundingBox();
  expect(box).not.toBeNull();
  expect(plan).not.toBeNull();
  const x = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + plan!.width / 7.4, y + plan!.width / 7.4, { steps: 12 });
  await page.mouse.up();
  await expect(chair).toHaveAttribute('aria-label', /X 1\.4, Y 1\.4/);
});

test('share snapshots and file import make separate, validated copies', async ({ page }) => {
  await saveRoom(page);
  const original = page.url();
  await page.getByRole('button', { name: 'Share a room snapshot' }).click();
  const share = await page.getByLabel('Room link', { exact: true }).inputValue();
  await page.goto(share);
  await expect(page.getByRole('heading', { name: 'Room to begin again.' })).toBeVisible();
  await page.getByRole('button', { name: 'Save a separate copy' }).click();
  await expect(page).toHaveURL(/#\/lab\/[a-f0-9-]+$/);
  expect(page.url()).not.toBe(original);
  await page.getByRole('button', { name: 'Export room', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Editable room file/ }).click();
  const file = await downloadPromise;
  const body = await readFile((await file.path())!);
  await route(page, 'collection');
  await expect(page.locator('.saved-room')).toHaveCount(2);
  await page
    .getByLabel('Import an ORQENSA room file')
    .setInputFiles({ name: 'room.json', mimeType: 'application/json', buffer: body });
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Save this room copy' }).click();
  await expect(page).toHaveURL(/#\/lab\/[a-f0-9-]+$/);
  await route(page, 'collection');
  await expect(page.locator('.saved-room')).toHaveCount(3);
  await page.getByLabel('Import an ORQENSA room file').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.getByRole('alert')).toContainText('not a valid');
  await expect(page.locator('.saved-room')).toHaveCount(3);
});

test('a brief validates, preserves its room snapshot and downloads', async ({ page }) => {
  await saveRoom(page);
  await page.getByRole('link', { name: 'Build a project brief' }).click();
  await expect(page.getByRole('heading', { name: 'Start with what matters.' })).toBeVisible();
  await page.getByRole('button', { name: 'Review your brief' }).click();
  await expect(page.getByText('Choose a name between 3 and 70 characters.')).toBeVisible();
  await page.getByLabel('Give your idea a name').fill('A quieter home');
  await page.getByLabel('Approximate total area').fill('120');
  await page.getByLabel('More storage', { exact: true }).check();
  await page.getByLabel('Anything else to make room for?').fill('A reading corner by the window.');
  await page.getByRole('button', { name: 'Review your brief' }).click();
  await expect(page.getByRole('heading', { name: 'A quieter home' })).toBeVisible();
  await expect(page.locator('.brief-layout')).toContainText('A room of your own');
  await page.getByRole('button', { name: 'Save brief on this browser' }).click();
  await expect(page.getByRole('button', { name: 'Saved in your collection' })).toBeDisabled();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download brief' }).click();
  const file = await downloadPromise;
  const content = await readFile((await file.path())!, 'utf8');
  expect(content).toContain('120 m²');
  expect(content).toContain('A reading corner');
  expect(content).toContain('has not been sent');
  await route(page, 'collection');
  await page.getByRole('link', { name: 'Read brief' }).click();
  await expect(page.getByRole('heading', { name: 'A quieter home' })).toBeVisible();
  await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.brief-review-actions')).toBeHidden();
  await expect(page.locator('.brief-layout')).toBeVisible();
});

test('other tabs receive saved changes and cannot use stale history', async ({ page, context }) => {
  await saveRoom(page);
  const second = await context.newPage();
  await second.emulateMedia({ reducedMotion: 'reduce' });
  await second.goto(page.url());
  await expect(second.getByRole('heading', { name: 'Room to rearrange.' })).toBeVisible();
  await page.getByRole('button', { name: 'Pale limestone', exact: true }).click();
  await expect(second.getByRole('button', { name: 'Pale limestone', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await second.getByRole('button', { name: 'Fine terrazzo', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Fine terrazzo', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Undo last change' })).toBeDisabled();
  await second.close();
});

test('blocked writes and corrupt collections show recovery without false saves', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'orqensa.collection.v1') throw new DOMException('Full', 'QuotaExceededError');
      set.call(this, key, value);
    };
  });
  await route(page, 'lab');
  await page.getByRole('button', { name: 'Save room', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('could not be saved');
  await expect(page).toHaveURL(/#\/lab$/);
  await expect(page.getByRole('button', { name: 'Save room', exact: true })).toBeEnabled();
  await page.context().clearCookies();
});

test('corrupt bytes can be downloaded before an explicit reset', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('orqensa.collection.v1', '{broken collection'),
  );
  await route(page, 'collection');
  await expect(
    page.getByRole('heading', { name: 'Your collection needs a moment.' }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download recovery copy' }).click();
  const file = await downloadPromise;
  expect(await readFile((await file.path())!, 'utf8')).toBe('{broken collection');
  await page.getByRole('button', { name: 'Start a new collection' }).click();
  await page.getByRole('button', { name: 'Replace unreadable collection' }).click();
  await expect(
    page.getByRole('heading', { name: 'A little room for your first idea.' }),
  ).toBeVisible();
});

test('plan drawing exports without executable user markup and bad share links are recoverable', async ({
  page,
}) => {
  await route(page, 'lab');
  await page.getByRole('button', { name: 'Rename room' }).click();
  await page.getByLabel('Room name', { exact: true }).fill('<script>A room</script>');
  await page.getByRole('button', { name: 'Keep this name' }).click();
  await page.getByRole('button', { name: 'Export room', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Room drawing/ }).click();
  const file = await downloadPromise;
  const svg = await readFile((await file.path())!, 'utf8');
  expect(svg).not.toContain('<script>');
  expect(svg).toContain('&lt;script&gt;');
  await route(page, 'share?room=bad%%%');
  await expect(page.getByRole('alert')).toContainText('could not be opened');
  await expect(page.getByRole('link', { name: 'Begin your own room' })).toBeVisible();
});

test('navigation, motion controls, accessibility scans and layouts', async ({
  page,
  isMobile,
}, testInfo) => {
  await route(page);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  if (isMobile) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('link', { name: 'Materials', exact: true })
      .click();
    await expect(page.getByRole('heading', { name: 'Touch with your eyes.' })).toBeVisible();
  }
  for (const path of ['', 'lab', 'materials', 'brief', 'collection']) {
    await route(page, path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(scan.violations).toEqual([]);
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await route(page);
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Resume motion', exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
  await route(page, 'lab');
  await page.screenshot({ path: testInfo.outputPath('lab.png'), fullPage: true });
});

test('3D enhancement offers a rendering or a usable plan fallback', async ({ page }, testInfo) => {
  await route(page, 'lab');
  await page.getByRole('button', { name: '3D study', exact: true }).click();
  await expect
    .poll(
      async () =>
        (await page.locator('.three-room canvas').count()) > 0 ||
        (await page.getByRole('alert').count()) > 0 ||
        (await page.locator('.view-unavailable').count()) > 0,
    )
    .toBe(true);
  if (await page.locator('.three-room canvas').count()) {
    await page.waitForTimeout(1000);
    await page.screenshot({ path: testInfo.outputPath('3d-room.png'), fullPage: true });
    await page.getByRole('button', { name: 'Rotate 3D viewpoint' }).click();
  }
  await page.getByRole('button', { name: 'Floor plan', exact: true }).click();
  await expect(page.locator('.floor-plan')).toBeVisible();
  await page.getByLabel('Add an object').selectOption('plant');
  await expect(page.locator('.object-list > button')).toHaveCount(8);
});
