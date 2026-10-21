import type { Page } from '@playwright/test';

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
