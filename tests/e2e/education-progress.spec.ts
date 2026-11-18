import { test, expect } from '@playwright/test';
import { chooseStep, showWorkshop } from './ui';

const handKey = 'robobuild-guide-v1:robotic-hand';

test('the catalog distinguishes numbered Hand instructions from wiring and the guide end', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start Robot Hand' }).click();
  await showWorkshop(page);
  const seek = page.getByLabel('Assembly position');
  await expect(seek).toBeEnabled();
  const end = Number(await seek.getAttribute('max'));
  await seek.fill(String(end - 800));
  await page.getByRole('button', { name: 'Back to build catalog' }).click();
  await expect(page.getByText('Wiring remains')).toBeVisible();
  await expect(page.getByText('End of guide reached')).toHaveCount(0);
  await page.getByRole('button', { name: 'Continue Robot Hand' }).click();
  await expect(page.getByRole('heading', { name: 'Wiring · last stage' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Watch what moves' })).toHaveCount(0);
  await showWorkshop(page);
  await expect(seek).toHaveValue(String(end - 800));
  await seek.fill(String(end));
  await page.getByRole('button', { name: 'Back to build catalog' }).click();
  await expect(page.getByText('End of guide reached')).toBeVisible();
});

test('reload restores the exact paused Hand hold; confirmed reset clears only Hand', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start Robot Hand' }).click();
  await page.getByRole('button', { name: 'Watch this step', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Watch again' })).toBeEnabled();
  await page.reload();
  await expect(page.getByText('1 of 28 guide steps reached')).toBeVisible();
  const continueHand = page.getByRole('button', { name: 'Continue Robot Hand', exact: true });
  await continueHand.click();
  await expect(page.getByRole('heading', { name: 'Step 1 of 28' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Watch again' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toHaveCount(0);
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).timeMs, handKey)).toBe(5000);
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Step 2 of 28' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to build catalog' }).click();
  const savedHand = await page.evaluate((key) => localStorage.getItem(key), handKey);

  await page.getByRole('button', { name: 'Start Advanced Driving Base' }).click();
  await showWorkshop(page);
  const seek = page.getByRole('slider', { name: 'Assembly position' });
  await seek.fill('10000');
  await expect(page.getByLabel('Assembly counts')).toContainText('7/234');
  await page.getByRole('button', { name: 'Back to build catalog' }).click();
  await expect(page.getByText('3 of 136 guide steps reached')).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), handKey)).toBe(savedHand);

  const hand = page.getByRole('article').filter({ has: continueHand });
  await expect(hand.getByRole('button', { name: 'Start over', exact: true })).toHaveCount(0);
  await continueHand.click();
  const stepTwo = page.getByRole('heading', { name: 'Step 2 of 28' });
  const opener = page.getByRole('button', { name: 'Start over', exact: true });
  const dialog = page.getByRole('dialog', { name: 'Start Robot Hand over?' });
  await expect(stepTwo).toBeVisible();
  await opener.click();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await expect(stepTwo).toBeVisible();
  await opener.click();
  await dialog.getByRole('button', { name: 'Start over', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Step 1 of 28' })).toBeVisible();
  await expect(opener).toBeFocused();
  expect(await page.evaluate((key) => localStorage.getItem(key), handKey)).toBeNull();
  await page.getByRole('button', { name: 'Back to build catalog' }).click();
  await expect(page.getByRole('button', { name: 'Start Robot Hand' })).toBeFocused();
  await page.getByRole('button', { name: 'Continue Advanced Driving Base' }).click();
  await showWorkshop(page);
  await expect(seek).toHaveValue('10000');
  await expect(page.getByLabel('Assembly counts')).toContainText('7/234');
});

test('bad JSON is ignored; stale timeline is discarded without overwriting a new checkpoint on 3D retry', async ({ page }) => {
  await page.goto('/');
  await page.evaluate((key) => localStorage.setItem(key, '{'), handKey);
  await page.reload();
  const start = page.getByRole('button', { name: 'Start Robot Hand' });
  await expect(start).toBeEnabled();
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ timeline: '[]', timeMs: 5000, heldStepId: 'hand-step-1', steps: 1, complete: false })), handKey);
  await page.reload();
  await page.route('**/models/library/2780.mpd', (route) => route.abort());
  await page.getByRole('button', { name: 'Continue Robot Hand' }).click();
  await expect(page.getByRole('heading', { name: 'Step 1 of 28' })).toBeVisible();
  await expect(page.locator('.guide-notices')).toContainText('This guide changed. Start again at the first step.');
  await expect(page.getByRole('alert')).toHaveCount(1);
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Step 2 of 28' })).toBeVisible();
  const fresh = await page.evaluate((key) => localStorage.getItem(key), handKey);
  await page.unroute('**/models/library/2780.mpd');
  await page.getByRole('button', { name: 'Try 3D again' }).click();
  await expect(page.getByRole('button', { name: 'Watch this step', exact: true })).toBeEnabled();
  expect(await page.evaluate((key) => localStorage.getItem(key), handKey)).toBe(fresh);
});

test('a failed browser-storage reset leaves the checkpoint available', async ({ page }) => {
  await page.addInitScript((key) => {
    const remove = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function(id) {
      if (id === key) throw new DOMException('Storage blocked', 'SecurityError');
      remove.call(this, id);
    };
  }, handKey);
  await page.goto('/');
  await page.getByRole('button', { name: 'Start Robot Hand' }).click();
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByRole('button', { name: 'Back to build catalog' }).click();
  const resume = page.getByRole('button', { name: 'Continue Robot Hand', exact: true });
  await resume.click();
  await page.getByRole('button', { name: 'Start over', exact: true }).click();
  const confirm = page.getByRole('dialog', { name: 'Start Robot Hand over?' });
  await confirm.getByRole('button', { name: 'Start over', exact: true }).click();
  await expect(confirm.getByRole('alert')).toContainText('couldn’t be cleared');
  await confirm.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Step 2 of 28' })).toBeVisible();
  await page.getByRole('button', { name: 'Back to build catalog' }).click();
  await expect(resume).toBeEnabled();
});

test('educational guide follows source prerequisites, actual CAD selections and reversible live motor/sensor state', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start Advanced Driving Base' }).click();
  await showWorkshop(page);
  await expect(page.locator('.robot-scene')).toHaveAttribute('aria-busy', 'false');
  await chooseStep(page, 'book1-step10');
  await page.getByText('View options', { exact: true }).click();
  await page.getByRole('checkbox', { name: 'How it works' }).check();
  await page.getByText('View options', { exact: true }).click();
  const guide = page.getByRole('region', { name: 'How it works' });
  await guide.getByRole('combobox', { name: 'Explain' }).selectOption('dependencies');
  await guide.getByRole('button', { name: /Review Front/ }).first().click();
  await expect(page.locator('.step-picker select')).toHaveValue('book1-step9');
  const seek = page.getByRole('slider', { name: 'Assembly position' });
  await seek.fill(await seek.getAttribute('max') as string);
  await guide.getByRole('combobox', { name: 'Explain' }).selectOption('motors');
  await guide.getByRole('button', { name: 'Inspect left-drive-motor · port A', exact: true }).click();
  await page.getByText('Technical details', { exact: true }).click();
  await expect(page.getByRole('complementary', { name: 'Parts and inspection' }).locator('dd').filter({ hasText: /^left-motor$/ })).toBeVisible();
  await page.getByRole('button', { name: 'Try the movement demo →' }).click();
  const simulationSeek = page.getByRole('slider', { name: 'Simulation position' });
  await simulationSeek.fill('5000');
  // Independent command integration: 4 s × 2 rad/s + 1 s × 1 rad/s.
  await expect(guide.getByLabel('left-drive-motor guide coordinate')).toHaveText('9.000 rad');
  await expect(guide.getByLabel('right-drive-motor guide coordinate')).toHaveText('10.000 rad');
  await simulationSeek.fill('0');
  await expect(guide.getByLabel('left-drive-motor guide coordinate')).toHaveText('0.000 rad');
  await guide.getByRole('combobox', { name: 'Explain' }).selectOption('sensors');
  await simulationSeek.fill('6000');
  await expect(guide.getByText('black', { exact: true })).toHaveCount(2);
  await expect(guide.getByText(/scripted-input/)).toHaveCount(2);
  await guide.getByRole('combobox', { name: 'Explain' }).selectOption('grip');
  await expect(guide).toContainText('No closed gripping linkage');
  await page.screenshot({ path: info.outputPath('graph-backed-guide.png'), fullPage: true });
  expect(errors).toEqual([]);
});
