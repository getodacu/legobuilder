import { expect, type Page } from '@playwright/test';

export const cameraView = (page: Page) => page.locator('.scene-aperture');

export async function expectFullCanvas(page: Page) {
  const canvas = page.getByRole('img', { name: /^Interactive assembly/ });
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
  expect(box?.x).toBeCloseTo(0, 0);
  expect(box?.y).toBeCloseTo(0, 0);
  expect(Math.abs(box!.width - viewport.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(box!.height - viewport.height)).toBeLessThanOrEqual(1);
}

export async function expandInstructions(page: Page) {
  const toggle = page.locator('.step-sheet-toggle');
  if (await toggle.isVisible() && await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
}

export async function showWorkshop(page: Page) {
  const toggle = page.getByRole('button', { name: 'Workshop tools', exact: true });
  if (await toggle.getAttribute('aria-pressed') !== 'true') await toggle.click();
}

export async function openDetails(page: Page, selector: string) {
  const details = page.locator(selector);
  if (await details.getAttribute('open') === null) await details.locator(':scope > summary').click();
}

export async function showParts(page: Page) {
  const toggle = page.getByRole('button', { name: 'Parts', exact: true });
  if (await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
}

export async function chooseStep(page: Page, id: string) {
  await openDetails(page, '.step-picker');
  await page.getByRole('combobox', { name: 'Building step', exact: true }).selectOption(id);
  await page.locator('.step-picker > summary').click();
}

export async function showReference(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Reference & credits', exact: true });
  if (!await dialog.isVisible()) await page.getByRole('button', { name: 'Reference & credits', exact: true }).click();
  return dialog;
}
