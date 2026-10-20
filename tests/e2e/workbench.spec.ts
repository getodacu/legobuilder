import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Independent transcription of the official manual callouts, not the generated model.
const source = JSON.parse(readFileSync(new URL('../../docs/research/data/advanced-driving-base.json', import.meta.url), 'utf8')) as {
  steps: { book: number; step: number; pdfPage: number; addedParts: { quantity: number }[] }[];
};

const failures = new WeakMap<Page, string[]>();
const partIds = ['beam-1', 'pin-1', 'pin-2', 'grey-connector-1', 'grey-connector-2', 'pin-3', 'pin-4'];
const seekRange = (page: Page) => page.getByRole('slider', { name: /Assembly position/ });
const counts = (page: Page) => page.getByLabel('Assembly counts');
const inventory = (page: Page) => page.getByRole('complementary', { name: 'Inventory and inspection' });
const instructions = (page: Page) => page.getByRole('complementary', { name: 'Instructions and sources' });
const viewer = (page: Page) => page.getByRole('img', { name: /^Interactive assembly/ });

// Observe only this test's page, never pre-existing console/CDP history.
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  failures.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
});

test.afterEach(async ({ page }, info) => {
  await info.attach('new-page-errors-and-failed-assets', {
    body: JSON.stringify(failures.get(page), null, 2), contentType: 'application/json'
  });
  expect(failures.get(page), 'No new page error, failed request or missing asset').toEqual([]);
});

async function capture(page: Page, info: TestInfo, name: string) {
  await page.screenshot({ path: info.outputPath(`${name}.png`), fullPage: true });
  await info.attach(name, { path: info.outputPath(`${name}.png`), contentType: 'image/png' });
}

async function openWorkbench(page: Page, reducedMotion: 'reduce' | 'no-preference' = 'reduce') {
  await page.emulateMedia({ reducedMotion });
  await page.goto('/');
  await page.locator('#open-advanced-driving-base').click();
  await expect(seekRange(page)).toBeEnabled();
  await expect(viewer(page)).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.robot-scene')).toHaveAttribute('aria-busy', 'false');
  await expect(seekRange(page)).toHaveValue('0');
}

async function seek(page: Page, timeMs: number) {
  await seekRange(page).fill(String(timeMs));
  await expect(seekRange(page)).toHaveValue(String(timeMs));
}

async function expectCounts(page: Page, installed: number, steps: number) {
  await expect(counts(page).locator('strong').nth(0)).toHaveText(`${installed}/234`);
  await expect(counts(page).locator('strong').nth(1)).toHaveText(String(234 - installed));
  await expect(counts(page).locator('strong').nth(2)).toHaveText(`${steps}/136`);
}

async function expectPage(page: Page, number: number, step: string) {
  const book = /^book(\d+)-/.exec(step)![1];
  await expect(instructions(page).getByRole('combobox', { name: 'Document', exact: true })).toHaveValue(`adb-book${book}`);
  await expect(instructions(page).getByLabel('One-based PDF page')).toHaveValue(String(number));
  await expect(instructions(page).getByLabel('Implemented source steps')).toHaveValue(step);
  await expect(instructions(page).getByRole('link', { name: new RegExp(`Open official page ${number} `) })).toHaveAttribute('href', new RegExp(`book${book}of5\\.pdf.*#page=${number}$`));
}

async function selectSourceStep(page: Page, book: number, step: number) {
  const index = source.steps.findIndex((entry) => entry.book === book && entry.step === step);
  expect(index, 'Numbered instruction exists in the independent manual transcription').toBeGreaterThanOrEqual(0);
  const installed = source.steps.slice(0, index).reduce((sum, entry) => sum + entry.addedParts.reduce((total, part) => total + part.quantity, 0), 0);
  await instructions(page).getByLabel('Implemented source steps').selectOption(`book${book}-step${step}`);
  await expectCounts(page, installed, index);
  await expectPage(page, source.steps[index].pdfPage, `book${book}-step${step}`);
}

test('catalog has all five source identities; permission-blocked VEX never requests an invented model', async ({ page }, info) => {
  const modelRequests: string[] = [];
  page.on('request', (request) => { if (/\/models\/.*(?:manifest\.json|\.(?:mpd|glb|gltf))/.test(request.url())) modelRequests.push(request.url()); });
  await page.goto('/');
  const cards = page.getByRole('article');
  await expect(cards).toHaveCount(5);
  for (const name of [/Advanced Driving Base/i, /Robot(?:ic)? Hand/i, /Quality Check/i, /Package Sorter/i, /(?:V5|VEX).*Clawbot/i]) {
    await expect(cards.getByRole('heading', { name })).toHaveCount(1);
  }
  const adb = cards.filter({ has: page.getByRole('heading', { name: /Advanced Driving Base/i }) });
  await expect(adb).toContainText(/136\s*\/\s*136/);
  await expect(adb).toContainText(/authored.*fit unchecked/i);
  await expect(adb.locator('.card-facts')).toContainText(/3 source steps/);
  await expect(adb.getByRole('button', { name: /Open workbench/i })).toBeEnabled();
  const preview = adb.getByRole('img');
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute('alt', /136\/136 instructions authored.*fit remains unverified/);
  await expect.poll(() => preview.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  const vex = cards.filter({ has: page.getByRole('heading', { name: /(?:V5|VEX).*Clawbot/i }) });
  await expect(vex.getByRole('img')).toHaveCount(0);
  await expect(vex.getByRole('button', { name: /Open.*workbench/i })).toHaveCount(0);
  await expect(vex).toContainText(/permission.*blocked|permission|conversion/i);
  await expect(vex).toContainText(/no procurement total|unresolved/i);
  const sourceButton = vex.getByRole('button', { name: /sources.*limitations/i });
  await sourceButton.click();
  const dialog = page.getByRole('dialog', { name: /Clawbot/i });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(/permission/i);
  await expect(dialog.getByRole('link', { name: /Build Instructions/i })).toHaveAttribute('href', /^https:\/\/content\.vexrobotics\.com\//);
  await capture(page, info, 'vex-source-blocked-not-model-acceptance');
  await page.keyboard.press('Escape');
  await expect(sourceButton).toBeFocused();
  expect(modelRequests.filter((url) => /vex|clawbot/i.test(url)), 'Permission-blocked VEX never loads geometry or a manifest').toEqual([]);
  await capture(page, info, 'catalog-actual-preview');
});

test('234 real inventory instances retain the first seven source seating events and reversible boundaries', async ({ page }, info) => {
  await openWorkbench(page);
  await expect(inventory(page).locator('.inventory-list > li')).toHaveCount(234);
  const ids = await inventory(page).locator('.inventory-list button > .mono').allTextContents();
  expect(new Set(ids).size, 'Each prepared unit is represented once').toBe(234);
  for (const id of partIds) await expect(inventory(page).locator('.inventory-list button').filter({ has: page.getByText(id, { exact: true }) })).toHaveCount(1);
  await expectCounts(page, 0, 0);
  await expectPage(page, 1, 'book1-step1');
  await expect(page.getByRole('button', { name: 'Previous source-step boundary' })).toBeDisabled();
  await capture(page, info, 'first-staged-234-real-parts');
  const canvasBox = await viewer(page).boundingBox();
  expect(canvasBox).not.toBeNull();
  expect(canvasBox!.width).toBeGreaterThan(500);
  expect(canvasBox!.height).toBeGreaterThanOrEqual(390);
  expect(canvasBox!.y + canvasBox!.height).toBeLessThanOrEqual(982);

  await page.getByRole('button', { name: 'Next source-step boundary' }).click();
  await expect(seekRange(page)).toHaveValue('4000');
  await expectCounts(page, 3, 1);
  await expectPage(page, 2, 'book1-step2');
  await page.getByRole('button', { name: 'Next source-step boundary' }).click();
  await expect(seekRange(page)).toHaveValue('7000');
  await expectCounts(page, 5, 2);
  await expectPage(page, 3, 'book1-step3');
  await page.getByRole('button', { name: 'Previous source-step boundary' }).click();
  await expect(seekRange(page)).toHaveValue('4000');
  await expectCounts(page, 3, 1);

  // Source seating events, not a second invocation of the assembly engine, are the oracle.
  const samples = [
    { time: 9999, installed: 7, steps: 2, page: 3 },
    { time: 1199, installed: 0, steps: 0, page: 1 },
    { time: 6400, installed: 5, steps: 1, page: 2 },
    { time: 3400, installed: 3, steps: 0, page: 1 },
    { time: 6399, installed: 3, steps: 1, page: 2 },
    { time: 9400, installed: 7, steps: 2, page: 3 },
    { time: 1200, installed: 1, steps: 0, page: 1 },
    { time: 9399, installed: 5, steps: 2, page: 3 },
    { time: 3399, installed: 1, steps: 0, page: 1 }
  ];
  for (const sample of [...samples, ...samples.slice().reverse()]) {
    await seek(page, sample.time);
    await expectCounts(page, sample.installed, sample.steps);
    await expectPage(page, sample.page, `book1-step${sample.page}`);
  }
  await seek(page, 8399);
  await expectCounts(page, 5, 2);
  await page.getByRole('button', { name: 'Focus active', exact: true }).click();
  await capture(page, info, 'intermediate-pins-pending');
  await seek(page, 9999);
  await expectCounts(page, 7, 2);
  await page.getByRole('button', { name: 'Resume auto camera', exact: true }).click();
  await capture(page, info, 'first-seven-source-bracket-seated');
  await seek(page, 10000);
  await expectCounts(page, 7, 3);
  await expect(inventory(page).locator('.part-state').filter({ hasText: /^Installed/ })).toHaveCount(7);
  await expectPage(page, 4, 'book1-step4');
  await expect(page.getByRole('button', { name: 'Next source-step boundary' })).toBeEnabled();
  await expect(page.getByRole('button', { name: /Play step/ })).toBeEnabled();
  await page.getByRole('button', { name: 'Focus active', exact: true }).click();
  await capture(page, info, 'first-seven-bracket-continues-to-step-four');
  await instructions(page).getByText('Assembly status & viewing', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Simulation locked' })).toBeDisabled();
  await expect(page.getByLabel('Post-assembly demonstration')).toContainText(/entire implemented assembly/);
  await seek(page, 0);
  await expectCounts(page, 0, 0);
  await expectPage(page, 1, 'book1-step1');
});

test('manual reading stays independent while mapped figures synchronize all books, including nonmatching Book 5 pages', async ({ page }, info) => {
  await openWorkbench(page);
  const panel = instructions(page);
  const pdfPage = panel.getByLabel('One-based PDF page');
  await pdfPage.fill('2');
  await expect(seekRange(page)).toHaveValue('0');
  await expectCounts(page, 0, 0);
  await panel.getByRole('button', { name: /Seek figure.*step 2/i }).first().click();
  await expect(seekRange(page)).toHaveValue('4000');
  await expectCounts(page, 3, 1);
  await expectPage(page, 2, 'book1-step2');
  await pdfPage.fill('38');
  await expect(panel.getByRole('button', { name: /Seek figure.*step 38/i })).toHaveCount(1);
  await expect(seekRange(page)).toHaveValue('4000');
  await panel.getByRole('button', { name: /Seek figure.*step 38/i }).click();
  await expectCounts(page, 73, 37);
  await expectPage(page, 38, 'book1-step38');
  await panel.getByRole('button', { name: 'Frame active operation ↗', exact: true }).click();
  await capture(page, info, 'manual-mapped-book1-final-gear');
  const beforeReading = await seekRange(page).inputValue();
  await panel.getByRole('combobox', { name: 'Document', exact: true }).selectOption('adb-book5');
  await expect(pdfPage).toHaveValue('1');
  await expect(panel.getByRole('button', { name: /Seek figure|Seek instruction/i })).toHaveCount(0);
  await expect(seekRange(page)).toHaveValue(beforeReading);
  await pdfPage.fill('22');
  await expect(seekRange(page)).toHaveValue(beforeReading);
  await panel.getByRole('button', { name: /Seek figure.*instruction 19/i }).click();
  await expectPage(page, 22, 'book5-step19');
  await expectCounts(page, 234, 135);
  await expect(panel.getByText('No additional hardware in this instruction.', { exact: true })).toBeVisible();
  await capture(page, info, 'manual-book5-page22-is-instruction19');
  await selectSourceStep(page, 2, 24);
  await capture(page, info, 'manual-mapped-other-book-wheel-join');
  await selectSourceStep(page, 1, 3);
  await expect(seekRange(page)).toHaveValue('7000');
  await selectSourceStep(page, 1, 1);
  await expect(seekRange(page)).toHaveValue('0');
});

test('the full 136-instruction source assembly reaches 234 units without recounting joins or final views and resets reversibly', async ({ page }, info) => {
  await openWorkbench(page);
  const stepOptions = instructions(page).getByLabel('Implemented source steps').locator('option');
  await expect(stepOptions).toHaveCount(136);
  expect(await stepOptions.evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value)))
    .toEqual(source.steps.map((entry) => `book${entry.book}-step${entry.step}`));
  await seek(page, 10000);
  const firstSeven = await viewer(page).screenshot();

  // Each book end is checked against independent introduction callouts, including reuse-only instructions.
  for (const [book, step] of [[1, 38], [2, 24], [3, 24], [4, 31], [5, 6]]) {
    await selectSourceStep(page, book, step);
  }
  await instructions(page).getByRole('button', { name: 'Frame active operation ↗', exact: true }).click();
  const beforeJoin = await viewer(page).screenshot();
  await page.getByRole('button', { name: /Play step/ }).click();
  await expectCounts(page, 220, 123);
  await expectPage(page, 10, 'book5-step7');
  await expect.poll(async () => (await viewer(page).screenshot()).equals(beforeJoin), { message: 'Source wheel-module join changes the actual scene without adding inventory again' }).toBe(false);
  await capture(page, info, 'difficult-book5-wheel-module-join');

  await selectSourceStep(page, 5, 19);
  await expectCounts(page, 234, 135);
  await page.getByRole('button', { name: /Play step/ }).click();
  const end = Number(await seekRange(page).getAttribute('max'));
  await expect(seekRange(page)).toHaveValue(String(end));
  await expectCounts(page, 234, 136);
  await expectPage(page, 22, 'book5-step19');
  await expect(instructions(page).locator('.source-list').first()).toContainText('PDF page 22 · printed instruction 19');
  await expect(inventory(page).locator('.part-state').filter({ hasText: /^Installed/ })).toHaveCount(234);
  await expect(page.getByRole('button', { name: 'Next source-step boundary' })).toBeDisabled();
  await expect(page.getByRole('button', { name: /Play step/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Enter post-assembly demonstration', exact: true })).toBeEnabled();
  await expect(page.locator('.header-coverage')).toHaveText(/136\/136 authored.*new fits unverified/);
  await expect(page.getByLabel('Post-assembly demonstration')).toContainText(/3\/136 source steps verified/);
  await expect(page.getByLabel('Post-assembly demonstration')).toContainText(/not a verified-robot seal/);
  await page.getByRole('button', { name: 'Fit whole', exact: true }).click();
  await expect.poll(async () => (await viewer(page).screenshot()).equals(firstSeven), { message: 'Full authored scene differs from the original seven-unit bracket' }).toBe(false);
  await capture(page, info, 'full-source-234-assembled-fit-unverified');
  const coverage = instructions(page).locator('details').filter({ has: page.getByText('Whole-source coverage & limitations', { exact: true }) });
  await coverage.locator('summary').click();
  await expect(coverage).toContainText(/136\/136 steps implemented · 3 verified/);
  await expect(coverage).toContainText(/unchecked|unverified|not.*certif/i);
  await capture(page, info, 'full-source-coverage-not-fit-certification');
  await seek(page, end);
  await expectCounts(page, 234, 136);

  await selectSourceStep(page, 1, 2);
  await expect(seekRange(page)).toHaveValue('4000');
  await seek(page, end);
  await expectCounts(page, 234, 136);
  await expectPage(page, 22, 'book5-step19');
  await page.getByRole('button', { name: /Reverse/ }).click();
  await expect(seekRange(page)).toHaveValue('0');
  await expectCounts(page, 0, 0);
  await expectPage(page, 1, 'book1-step1');
  await expect(inventory(page).locator('.part-state').filter({ hasText: /pending · robot$/ })).toHaveCount(234);
  await expect(page.getByRole('button', { name: 'Simulation locked' })).toBeDisabled();
  await capture(page, info, 'full-source-reset-staged-inventory');
});

test('real non-reduced playback moves while pending, pauses, resumes to one-step stop, scrubs to stop and reverses', async ({ page }, info) => {
  await openWorkbench(page, 'no-preference');
  await page.getByRole('combobox', { name: 'Speed', exact: true }).selectOption('0.25');
  const first = await viewer(page).screenshot();
  await page.getByRole('button', { name: /Play step/ }).click();
  await expect.poll(async () => Number(await seekRange(page).inputValue())).toBeGreaterThan(200);
  await page.getByRole('button', { name: /Pause/, exact: false }).click();
  const pausedAt = Number(await seekRange(page).inputValue());
  expect(pausedAt).toBeGreaterThan(0);
  expect(pausedAt).toBeLessThan(1200);
  await expectCounts(page, 0, 0);
  await expect(inventory(page).locator('.inventory-list button').filter({ has: page.getByText('beam-1', { exact: true }) })).toContainText(/motion.*pending/i);
  expect((await viewer(page).screenshot()).equals(first), 'Actual rendered geometry moves before installation').toBe(false);
  await capture(page, info, 'actual-play-intermediate-pending');
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(seekRange(page)).toHaveValue(String(pausedAt));
  await page.getByRole('combobox', { name: 'Speed', exact: true }).selectOption('2');
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await expect(seekRange(page)).toHaveValue('4000');
  await expectCounts(page, 3, 1);
  await expect(page.getByRole('button', { name: /Pause/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Resume', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Play all', exact: true }).click();
  await expect.poll(async () => Number(await seekRange(page).inputValue())).toBeGreaterThan(4200);
  await seek(page, 7000);
  await expect(page.getByRole('button', { name: /Pause/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Resume', exact: true })).toBeDisabled();
  await seek(page, 10000);
  await page.getByRole('combobox', { name: 'Speed', exact: true }).selectOption('0.25');
  await page.getByRole('button', { name: /Reverse/ }).click();
  await expect.poll(async () => Number(await seekRange(page).inputValue())).toBeLessThan(9800);
  await page.getByRole('button', { name: /Pause/ }).click();
  const reversedAt = Number(await seekRange(page).inputValue());
  expect(reversedAt).toBeGreaterThan(7000);
  // The two source pins seat at 9400 ms; while reversing through this step they remain pending.
  await expectCounts(page, reversedAt >= 9400 ? 7 : 5, 2);
  await page.getByRole('combobox', { name: 'Speed', exact: true }).selectOption('2');
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await expect(seekRange(page)).toHaveValue('0');
  await expectCounts(page, 0, 0);
  await expect(page.getByRole('button', { name: /Reverse/ })).toBeDisabled();
});

test('inspection, presentation modes and camera controls preserve assembly accounting', async ({ page }, info) => {
  await openWorkbench(page);
  const end = Number(await seekRange(page).getAttribute('max'));
  await seek(page, end);
  await page.getByRole('button', { name: 'Fit whole', exact: true }).click();
  const studioPixels = await viewer(page).screenshot();
  await page.getByRole('button', { name: 'Technical', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Technical', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await viewer(page).screenshot()).equals(studioPixels), { message: 'Technical mode changes the actual full-source rendering' }).toBe(false);
  await capture(page, info, 'technical-full-source-real-geometry');
  const technicalPixels = await viewer(page).screenshot();
  await page.getByRole('button', { name: 'Explode', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Explode', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expectCounts(page, 234, 136);
  await expect(seekRange(page)).toHaveValue(String(end));
  await expect.poll(async () => (await viewer(page).screenshot()).equals(technicalPixels), { message: 'Explode must separate actual rendered geometry' }).toBe(false);
  await capture(page, info, 'exploded-full-source-234-units');
  const row = inventory(page).locator('.inventory-list button').filter({ has: page.getByText('pin-1', { exact: true }) });
  await row.click();
  await expect(inventory(page).locator('.inspector-facts')).toContainText('pin-1');
  await expect(inventory(page).locator('.inspector-facts')).toContainText('2780');
  const assemblyPixels = await viewer(page).screenshot();
  await inventory(page).getByRole('button', { name: 'Isolate part', exact: true }).click();
  await expect(page.getByRole('group', { name: 'View mode' }).getByRole('button', { name: 'Inspection', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => (await viewer(page).screenshot()).equals(assemblyPixels), { message: 'Isolation must change rendered component visibility' }).toBe(false);
  await capture(page, info, 'inspection-isolated-pin-1');
  await counts(page).getByRole('button', { name: 'Exit isolate', exact: true }).click();
  await expectCounts(page, 234, 136);
  for (const name of ['Fit module', 'Focus active', 'Fit whole', 'Reset view']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeEnabled();
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.getByRole('button', { name: 'Resume auto camera', exact: true })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Resume auto camera', exact: true }).click();
  const beforeManualOrbit = await viewer(page).screenshot();
  await viewer(page).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('button', { name: 'Resume auto camera', exact: true })).toBeVisible();
  await expect.poll(async () => (await viewer(page).screenshot()).equals(beforeManualOrbit), { message: 'Manual orbit changes the actual camera view' }).toBe(false);
  await seek(page, 4000);
  await expect(page.getByRole('button', { name: 'Resume auto camera', exact: true })).toBeVisible();
  await expectCounts(page, 3, 1);
  await page.getByRole('button', { name: 'Resume auto camera', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Resume auto camera', exact: true })).toHaveCount(0);
});

test('keyboard shortcuts respect typing, range and help-dialog focus', async ({ page }) => {
  await openWorkbench(page);
  const search = inventory(page).getByRole('searchbox');
  await search.fill('pin');
  await search.press('x');
  await search.press(']');
  await search.press('Space');
  await expect(seekRange(page)).toHaveValue('0');
  await expect(page.getByRole('button', { name: 'Explode', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await search.fill('');
  const documentSelector = instructions(page).getByRole('combobox', { name: 'Document', exact: true });
  await documentSelector.focus();
  await page.keyboard.press('x');
  await page.keyboard.press(']');
  await expect(seekRange(page)).toHaveValue('0');
  await expect(page.getByRole('button', { name: 'Explode', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await seekRange(page).focus();
  await page.keyboard.press('End');
  await expectCounts(page, 234, 136);
  await expectPage(page, 22, 'book5-step19');
  await page.keyboard.press('Home');
  await expectCounts(page, 0, 0);
  await expectPage(page, 1, 'book1-step1');
  const help = page.getByRole('button', { name: /Keyboard help/ });
  await help.click();
  const dialog = page.getByRole('dialog', { name: /Keyboard.*camera/ });
  await expect(dialog).toBeVisible();
  await page.keyboard.press(']');
  await page.keyboard.press('x');
  await expect(seekRange(page)).toHaveValue('0');
  await page.keyboard.press('Tab');
  // Native modal tab order can include browser chrome, but never a background control.
  await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement) || document.activeElement === document.body)).toBe(true);
  await page.keyboard.press('Shift+Tab');
  await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(help).toBeFocused();
  await page.locator('main#main').focus();
  await page.keyboard.press(']');
  await expect(seekRange(page)).toHaveValue('4000');
  await page.keyboard.press('[');
  await expect(seekRange(page)).toHaveValue('0');
  await page.keyboard.press('t');
  await expect(page.getByRole('button', { name: 'Technical', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('x');
  await expect(page.getByRole('button', { name: 'Explode', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

for (const width of [320, 390]) {
  test(`${width}px catalog and workbench have no horizontal overflow and exclusive accessible drawers`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await expect(page.locator('#open-advanced-driving-base')).toBeEnabled();
    const assertNoOverflow = async () => expect(await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))).toEqual({ scroll: width, client: width });
    await assertNoOverflow();
    await capture(page, info, `catalog-${width}`);
    await openWorkbench(page);
    await assertNoOverflow();
    await expect(page.getByRole('button', { name: 'Instructions', exact: true })).toHaveAttribute('aria-expanded', 'false');
    await page.getByRole('button', { name: 'Instructions', exact: true }).click();
    await expect(instructions(page).getByRole('heading', { name: 'Instructions', exact: true })).toBeFocused();
    await expect(page.getByRole('button', { name: 'Instructions', exact: true })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('button', { name: 'Inventory & inspection', exact: true })).toHaveAttribute('aria-expanded', 'false');
    await selectSourceStep(page, 5, 19);
    await expect(instructions(page).getByLabel('One-based PDF page')).toHaveValue('22');
    expect(await instructions(page).locator('.panel-content').evaluate((element) => element.scrollWidth - element.clientWidth), 'Source panel content fits the mobile drawer').toBeLessThanOrEqual(1);
    await assertNoOverflow();
    await capture(page, info, `instructions-drawer-${width}`);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Instructions', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Inventory & inspection', exact: true }).click();
    await expect(inventory(page).getByRole('heading', { name: 'Parts & evidence', exact: true })).toBeFocused();
    await expect(page.getByRole('button', { name: 'Instructions', exact: true })).toHaveAttribute('aria-expanded', 'false');
    await expect(inventory(page).locator('.inventory-list > li')).toHaveCount(234);
    await expect(inventory(page)).toContainText('234 individual instances shown');
    expect(await inventory(page).locator('.panel-content').evaluate((element) => element.scrollWidth - element.clientWidth), '234-instance inventory content fits the mobile drawer').toBeLessThanOrEqual(1);
    await assertNoOverflow();
    await capture(page, info, `inventory-drawer-${width}`);
    await inventory(page).getByRole('button', { name: 'Collapse inventory' }).click();
    await expect(page.getByRole('button', { name: 'Inventory & inspection', exact: true })).toBeFocused();
    await assertNoOverflow();
    await capture(page, info, `workbench-${width}`);
    const help = page.getByRole('button', { name: /Keyboard help/ });
    await help.click();
    await expect(page.getByRole('dialog', { name: /Keyboard.*camera/ })).toBeVisible();
    await assertNoOverflow();
    await page.keyboard.press('Escape');
    await expect(help).toBeFocused();
  });
}
