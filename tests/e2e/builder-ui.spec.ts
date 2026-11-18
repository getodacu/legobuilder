import { chromium, test, expect, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cameraView, chooseStep, expandInstructions, expectFullCanvas, showParts, showReference, showWorkshop } from './ui';

const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const handStep = (page: Page, number: number) => page.getByRole('heading', { name: `Step ${number} of 28`, exact: true });

async function openHand(page: Page) {
  await page.goto('/');
  await button(page, 'Start Robot Hand').click();
  await expect(handStep(page, 1)).toBeVisible();
}

test('desktop step framing restores the three opening pieces after showing the tray or moving the camera', async ({ page }, info) => {
  await page.setViewportSize({ width: 1257, height: 1313 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const cardSizes = await page.getByRole('article').evaluateAll((cards) => cards.map((card) => ({
    row: card.getBoundingClientRect().height,
    preview: card.querySelector('.card-preview')!.getBoundingClientRect().height,
    body: card.querySelector('.card-body')!.getBoundingClientRect().height
  })));
  expect(new Set(cardSizes.map(({ row }) => row)).size).toBe(1);
  for (const { preview, body } of cardSizes) expect(preview).toBe(body);
  await info.attach('catalog-1257px', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  await button(page, 'Start Advanced Driving Base').click();
  await expect(button(page, 'Look at this step')).toBeEnabled();
  await expectFullCanvas(page);
  const panel = (await page.getByRole('complementary', { name: 'Build instructions' }).boundingBox())!;
  const clear = (await cameraView(page).boundingBox())!;
  expect(clear.x).toBeGreaterThan(panel.x + panel.width);
  const initial = await cameraView(page).screenshot();
  await info.attach('assembly-1257px', { body: await page.screenshot(), contentType: 'image/png' });
  await button(page, 'See whole build').click();
  await expect.poll(async () => (await cameraView(page).screenshot()).equals(initial)).toBe(false);
  await button(page, 'Look at this step').click();
  await expect.poll(async () => (await cameraView(page).screenshot()).equals(initial)).toBe(true);

  await page.getByRole('img', { name: /^Interactive assembly/ }).press('ArrowLeft');
  await expect.poll(async () => (await cameraView(page).screenshot()).equals(initial)).toBe(false);
  await button(page, 'Watch this step').click();
  await expect(button(page, 'Watch again')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Step 1 of 136' })).toBeVisible();
  const replayed = await cameraView(page).screenshot();
  await button(page, 'Look at this step').click();
  await expect.poll(async () => (await cameraView(page).screenshot()).equals(replayed)).toBe(false);
  const canvas = page.getByRole('img', { name: /^Interactive assembly/ });
  await canvas.press('ArrowLeft');
  await button(page, 'Next step').click();
  await expect(page.getByRole('heading', { name: 'Step 2 of 136' })).toBeVisible();
  await expect(button(page, 'Watch again')).toBeEnabled();
  const nextFrame = await cameraView(page).screenshot();
  await canvas.press('ArrowLeft');
  await expect.poll(async () => (await cameraView(page).screenshot()).equals(nextFrame)).toBe(false);
  const moved = await cameraView(page).screenshot();
  await button(page, 'Watch again').click();
  await expect.poll(async () => (await cameraView(page).screenshot()).equals(moved)).toBe(true);
  await button(page, 'Look at this step').click();
  await expect.poll(async () => (await cameraView(page).screenshot()).equals(nextFrame)).toBe(true);
  await button(page, 'Back a step').click();
  await expect.poll(async () => (await cameraView(page).screenshot()).equals(initial)).toBe(true);
});

test('320px catalog offers four guides and the Hand action follows its build details', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  const cards = page.getByRole('article');
  await expect(cards).toHaveCount(4);
  const hand = cards.first();
  await expect(hand).toContainText('Start here · Shortest guide');
  await expect(hand).toContainText('28 numbered steps + wiring');
  for (const card of await cards.all()) {
    await expect(card.getByText('Manufacturer', { exact: true })).toBeVisible();
    await expect(card.getByText('Independently checked coverage')).toHaveCount(0);
    await expect(card.locator('summary')).toHaveCount(0);
  }
  const start = hand.getByRole('button', { name: 'Start Robot Hand', exact: true });
  await expect(hand.getByRole('button')).toHaveCount(1);
  await expect(hand.locator('.card-body > :last-child')).toHaveText('Start Robot Hand');
  await start.scrollIntoViewIfNeeded();
  await expect(start).toBeInViewport({ ratio: 1 });
  await info.attach('hand-action-320px', { body: await page.screenshot(), contentType: 'image/png' });
  await start.click();
  await expect(handStep(page, 1)).toBeVisible();
  await expectFullCanvas(page);
  const instructions = page.locator('.step-sheet-toggle');
  await expect(instructions).toHaveAttribute('aria-expanded', 'false');
  await expect(instructions).toContainText('Read before building');
  await expandInstructions(page);
  const parts = page.getByRole('region', { name: 'Parts for this step' });
  const hub = parts.getByRole('listitem').filter({ hasText: 'hub (control box)' });
  const pins = parts.getByRole('listitem').filter({ hasText: 'friction pin' });
  await expect(hub.getByText('×1')).toBeVisible();
  await expect(pins.getByText('Black')).toBeVisible();
  await expect(pins.getByText('×4')).toBeVisible();
  for (const [part, id] of [[hub, '45601c01'], [pins, '2780']] as const) {
    const image = part.locator('img');
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute('src', new RegExp(`/previews/parts/${id}-.*\\.webp$`));
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => [img.naturalWidth, img.width, img.height])).toEqual([128, 56, 56]);
  }
  await expect(page.getByRole('link', { name: 'page 3 of the official instructions' })).toHaveAttribute('href', /pass-the-brick.*\.pdf.*#page=3$/);
  await expect(page.getByRole('link', { name: 'Official instructions · page 4 ↗' })).toHaveAttribute('href', /#page=4$/);
});

test('Parts shows color-matched CAD thumbnails in the dialog and sidebar', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await button(page, 'Start Quality Check Robot').click();

  for (const width of [320, 1104, 1250]) {
    await page.setViewportSize({ width, height: 800 });
    await showParts(page);
    const parts = width < 1200 ? page.getByRole('dialog', { name: 'Parts', exact: true }) : page.getByRole('complementary', { name: 'Parts and inspection' });
    await parts.getByRole('combobox').selectOption('sample');
    await expect(parts.locator('.part-group > summary')).toHaveCount(4);
    for (const [color, material] of [['Green', 2], ['Blue', 1], ['Red', 4], ['Magenta', 26]] as const) {
      const image = parts.locator('.part-group > summary').filter({ hasText: `${color} · Sample` }).locator('img');
      await expect(image).toHaveAttribute('src', `/previews/parts/39789-ldraw-${material}.webp`);
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(128);
      await expect(image).toBeVisible();
    }
    expect(await parts.evaluate((panel) => panel.scrollWidth <= panel.clientWidth)).toBe(true);
    await info.attach(`parts-${width}px`, { body: await parts.screenshot(), contentType: 'image/png' });
    await parts.getByRole('button', { name: 'Collapse parts' }).click();
    await expect(parts).toBeHidden();
  }

  await showWorkshop(page);
  const image = page.getByRole('region', { name: 'Parts for this step' }).getByRole('button', { name: /^Inspect 1 Tan/ }).locator('img');
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(128);
});

for (const motion of ['no-preference', 'reduce'] as const) {
  test(`${motion}: replay holds the same instruction and Next advances just one`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: motion });
    await openHand(page);
    await button(page, 'Watch this step').click();
    if (motion === 'no-preference') {
      await button(page, 'Pause').click();
      await expect(button(page, 'Resume')).toBeFocused();
      await button(page, 'Resume').click();
    }
    await expect(button(page, 'Watch again')).toBeFocused();
    await expect(handStep(page, 1)).toBeVisible();
    await expect(page.getByText('Insert four black pins into hub end.')).toBeVisible();
    await expect(page.locator('.required-list')).toContainText('friction pin');
    await button(page, 'Watch again').click();
    await expect(button(page, 'Watch again')).toBeEnabled();
    await expect(handStep(page, 1)).toBeVisible();
    await button(page, 'Next step').click();
    await expect(handStep(page, 2)).toBeVisible();
    await expect(button(page, motion === 'reduce' ? 'Watch again' : 'Pause')).toBeEnabled();
    await page.keyboard.press('[');
    await expect(handStep(page, 1)).toBeVisible();
  });
}

test('last Hand stage gates the same-scene demo with visible Play, replay and return focus', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHand(page);
  await showWorkshop(page);
  await chooseStep(page, 'hand-wiring');
  await button(page, 'Workshop tools').click();
  const wiring = page.getByRole('heading', { name: 'Wiring · last stage' });
  await expect(wiring).toBeVisible();
  await expandInstructions(page);
  await expect(page.getByRole('link', { name: 'Official instructions · page 32 ↗' })).toHaveAttribute('href', /#page=32$/);
  const launch = button(page, 'Watch what moves');
  await expect(launch).toHaveCount(0);
  await expect(page.getByText('Finish the guide to watch it move.')).toHaveCount(1);
  await expect(button(page, 'Watch this step')).toBeEnabled();
  const canvas = await page.getByRole('img', { name: /^Interactive assembly/ }).elementHandle();
  await button(page, 'Next step').click();
  await expect(wiring).toBeVisible();
  await expect(launch).toBeFocused();
  await launch.click();
  await expectFullCanvas(page);
  const play = button(page, 'Play');
  const pause = button(page, 'Pause');
  await expect(page.getByRole('heading', { name: 'Movement demo' })).toBeFocused();
  await expect(play).toBeInViewport({ ratio: 1 });
  await expect(pause).toHaveCount(0);
  await expect(page.getByText('This is a simulation. A real robot may move differently.')).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Simulation position' })).not.toBeVisible();
  await info.attach('guided-demo-390px', { body: await page.screenshot(), contentType: 'image/png' });
  await page.keyboard.press('Tab');
  await expect(play).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(pause).toBeFocused();
  await pause.click();
  await expect(play).toBeFocused();
  await play.click();
  await expect(button(page, 'Play again')).toBeFocused();
  await button(page, 'Play again').click();
  await expect(pause).toBeEnabled();
  expect(await canvas!.evaluate((element) => element === document.querySelector('.robot-scene canvas'))).toBe(true);
  await button(page, 'Back to build').click();
  await expect(launch).toBeFocused();
  await launch.click();
  await page.keyboard.press('Escape');
  await expect(launch).toBeFocused();
});

test('short landscape keeps the instructions, touch orbit and native Parts reachable', async ({ browser }, info) => {
  const context = await browser.newContext({ viewport: { width: 740, height: 320 }, hasTouch: true });
  try {
    const page = await context.newPage();
    await page.goto(new URL('/', info.project.use.baseURL).href);
    await button(page, 'Start Robot Hand').click();
    await expect(handStep(page, 1)).toBeVisible();
    await expectFullCanvas(page);
    await expandInstructions(page);
    const source = page.getByRole('link', { name: 'Official instructions · page 4 ↗' });
    await source.scrollIntoViewIfNeeded();
    await expect(source).toBeInViewport();
    await expect(button(page, 'Next step')).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(740);
    await page.locator('.step-sheet-toggle').click();
    const box = (await cameraView(page).boundingBox())!;
    await expect(button(page, 'Look at this step')).toBeEnabled();
    const before = await cameraView(page).screenshot();
    const cdp = await context.newCDPSession(page);
    const y = box.y + box.height / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + 100, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: box.x + 155, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(async () => (await cameraView(page).screenshot()).equals(before)).toBe(false);
    await button(page, 'Look at this step').click();
    await expect(page.getByText('Turn or zoom', { exact: true })).toHaveCount(0);

    const parts = button(page, 'Parts');
    await parts.click();
    const dialog = page.getByRole('dialog', { name: 'Parts', exact: true });
    const search = dialog.getByRole('searchbox');
    await search.fill('no matching part');
    await page.keyboard.press(']');
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Clear search' })).toBeFocused();
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((el) => el.contains(document.activeElement) || document.activeElement === document.body)).toBe(true);
    await search.focus();
    await search.press('Escape');
    await expect(parts).toBeFocused();
    await expect(handStep(page, 1)).toBeVisible();
    await parts.click();
    await expect(search).toHaveValue('no matching part]');
    await page.setViewportSize({ width: 1250, height: 800 });
    await expect(dialog).toHaveCount(0);
    await expect(parts).toBeFocused();
    await parts.click();
    await expect(page.getByRole('complementary', { name: 'Parts and inspection' }).getByRole('searchbox')).toHaveValue('no matching part]');
  } finally { await context.close(); }
});

test('Chromium 200% browser zoom keeps safety links and transport operable', async ({}, info) => {
  const extension = info.outputPath('test-zoom-extension');
  await mkdir(extension, { recursive: true });
  await writeFile(join(extension, 'manifest.json'), JSON.stringify({
    manifest_version: 3, name: 'RoboBuild zoom test', version: '1', permissions: ['tabs'],
    background: { service_worker: 'worker.js' }
  }));
  await writeFile(join(extension, 'worker.js'), 'chrome.runtime.onInstalled.addListener(() => {});');
  const context = await chromium.launchPersistentContext('', {
    channel: 'chromium', headless: true, viewport: null,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`, '--window-size=1480,728']
  });
  try {
    const page = context.pages()[0];
    await page.goto(new URL('/', info.project.use.baseURL).href);
    const before = await page.evaluate(() => devicePixelRatio);
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const zoom = await worker.evaluate(async () => {
      const { chrome } = globalThis as unknown as { chrome: { tabs: {
        query(query: { active: boolean; currentWindow: boolean }): Promise<{ id: number }[]>;
        setZoom(id: number, factor: number): Promise<void>;
        getZoom(id: number): Promise<number>;
      } } };
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.setZoom(tab.id, 2);
      return chrome.tabs.getZoom(tab.id);
    });
    expect(zoom).toBe(2);
    await expect.poll(() => page.evaluate(() => devicePixelRatio)).toBe(2 * before);
    await button(page, 'Start Robot Hand').click();
    await expect(handStep(page, 1)).toBeVisible();
    await expectFullCanvas(page);
    await expandInstructions(page);
    for (const name of ['page 3 of the official instructions', 'Official instructions · page 4 ↗']) {
      const link = page.getByRole('link', { name, exact: true });
      await link.evaluate((element) => element.scrollIntoView({ block: 'center' }));
      await expect(link).toBeInViewport({ ratio: 1 });
      await link.click({ trial: true });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => innerWidth));
    await button(page, 'Next step').click();
    await expect(handStep(page, 2)).toBeVisible();
  } finally { await context.close(); }
});

test('geometry abort leaves reading and source navigation working; retry preserves position', async ({ page }, info) => {
  const failedGeometry = '**/models/library/2780.mpd';
  await page.route(failedGeometry, (route) => route.abort());
  await openHand(page);
  await expect(page.getByRole('alert')).toHaveCount(1);
  await expect(page.getByRole('alert')).toContainText('3D isn’t available');
  await expect(page.getByRole('link', { name: 'Official instructions · page 4 ↗' })).toBeVisible();
  for (const name of ['Watch this step', 'Look at this step', 'See whole build']) await expect(button(page, name)).toBeDisabled();
  await expect(button(page, 'Watch what moves')).toHaveCount(0);
  await info.attach('geometry-failure', { body: await page.screenshot(), contentType: 'image/png' });
  await button(page, 'Next step').click();
  await expect(handStep(page, 2)).toBeVisible();
  await showWorkshop(page);
  await chooseStep(page, 'hand-step-1');
  const manual = await showReference(page);
  await manual.getByLabel('PDF page', { exact: true }).fill('5');
  await manual.getByRole('button', { name: 'Go to figure Numbered step 2 →' }).click();
  await expect(page.getByRole('link', { name: 'Official instructions · page 5 ↗' })).toBeVisible();
  await chooseStep(page, 'hand-step-1');
  await expect(page.getByRole('link', { name: 'Official instructions · page 4 ↗' })).toBeVisible();
  await button(page, 'Workshop tools').click();
  await button(page, 'Next step').click();
  await page.unroute(failedGeometry);
  await button(page, 'Try 3D again').click();
  await expect(handStep(page, 2)).toBeVisible();
  await expect(button(page, 'Watch this step')).toBeEnabled();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('manifest abort offers safe recovery without inventing steps', async ({ page }) => {
  const failedManifest = '**/models/robotic-hand/manifest.json';
  await page.route(failedManifest, (route) => route.abort());
  await page.goto('/');
  await button(page, 'Start Robot Hand').click();
  await expect(page.getByRole('alert')).toContainText('This guide couldn’t open.');
  await expect(button(page, 'All builds')).toBeEnabled();
  await expect(page.getByRole('link', { name: 'Official building instructions ↗' })).toHaveAttribute('href', /education\.lego\.com/);
  await expect(button(page, 'Next step')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /^Step / })).toHaveCount(0);
  await page.unroute(failedManifest);
  await button(page, 'Retry').click();
  await expect(handStep(page, 1)).toBeVisible();
});

test('workspace import retry reloads into an allowlisted build only', async ({ page }) => {
  const origin = 'http://127.0.0.1:5188/';
  const chunk = '**/src/lib/components/Workspace.svelte*';
  await page.route(chunk, (route) => route.abort(), { times: 1 });
  await page.goto(origin);
  await button(page, 'Start Robot Hand').click();
  await expect(page.getByRole('alert')).toContainText('This guide couldn’t open.');
  await button(page, 'Retry').click();
  await expect(page).toHaveURL(`${origin}?build=robotic-hand`);
  await expect(handStep(page, 1)).toBeVisible();
  await button(page, 'Back to build catalog').click();
  await expect(page).toHaveURL(origin);
  await page.goto(`${origin}?build=not-a-build`);
  await expect(button(page, 'Start Robot Hand')).toBeEnabled();
});

test('Workshop keeps grouped parts, source navigation and technical playback controls', async ({ page }, info) => {
  await page.goto('/');
  await button(page, 'Start Advanced Driving Base').click();
  await showWorkshop(page);
  const seek = page.getByLabel('Assembly position');
  await expect(seek).toBeEnabled();
  await expect(page.getByRole('heading', { name: 'Prepare the 9-hole beam', exact: true })).toHaveCount(1);
  await expect(page.locator('.required-list > li')).toHaveCount(2);
  await expect(page.locator('.required-list')).toContainText('×2');
  await expect(page.locator('.view-options')).not.toHaveAttribute('open');
  await expect(page.locator('.playback-options')).not.toHaveAttribute('open');
  const reference = await showReference(page);
  await expect(reference.getByLabel('PDF page', { exact: true })).toHaveValue('1');
  await reference.getByLabel('PDF page', { exact: true }).fill('2');
  await expect(seek).toHaveValue('0');
  await page.keyboard.press('Escape');
  await expect(button(page, 'Reference & credits')).toBeFocused();
  await chooseStep(page, 'book5-step9');
  await expect(page.getByRole('link', { name: 'Official instructions · page 12 ↗' })).toHaveAttribute('href', /advanced-driving-base-bi-pdf-book5of5\.pdf.*#page=12$/);
  await showParts(page);
  const parts = page.getByRole('complementary', { name: 'Parts and inspection' });
  await parts.getByRole('searchbox').fill('pin-1');
  await parts.locator('.instance-list button').filter({ has: page.getByText('pin-1', { exact: true }) }).click();
  await expect(parts.getByRole('heading', { name: 'Black friction pin — beam hole 4' })).toBeVisible();
  await expect(parts.locator('.part-technical')).not.toHaveAttribute('open');
  await info.attach('workshop-desktop', { body: await page.screenshot(), contentType: 'image/png' });
});
