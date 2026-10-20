import { test, expect } from '@playwright/test';

const builds = [
  { id: 'robotic-hand', units: '39/39', stages: '29/29', steps: '28/28', time: 54600, demoTime: 4200, scenario: /coupled grip, hold and release/i, reading: /Port F: 2\.241 rad/, complete: true },
  { id: 'quality-check', units: '55/55', stages: '30/30', steps: '30/30', time: 60950, demoTime: 5300, scenario: /inspection-response demo/i, reading: /Sensor D: violet/, complete: true },
  { id: 'package-sorter', units: '158/158', stages: '80/80', steps: '80/80', time: 138450, demoTime: 6000, scenario: /motor replay — pickup disabled/i, reading: /Port F:/, complete: false }
] as const;

for (const build of builds) {
  test(`${build.id}: source-linked assembly and actual post-assembly mechanism remain honest`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('requestfailed', (request) => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
    page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.emulateMedia({ reducedMotion: build.id === 'package-sorter' ? 'no-preference' : 'reduce' });
    await page.goto('/');
    const card = page.locator(`#open-${build.id}`);
    await expect(card).toBeEnabled();
    await card.click();
    const seek = page.getByRole('slider', { name: 'Assembly position' });
    const viewer = page.getByRole('img', { name: /^Interactive assembly/ });
    await expect(seek).toBeEnabled();
    await expect(page.locator('.robot-scene')).toHaveAttribute('aria-busy', 'false');
    await expect(seek).toHaveAttribute('max', String(build.time));
    const before = await viewer.screenshot();
    await seek.fill(String(build.time));
    await expect(page.getByLabel('Assembly counts')).toContainText(build.units);
    await expect(page.getByLabel('Assembly counts')).toContainText(build.stages);
    await expect(page.locator('.header-coverage')).toContainText(`${build.steps} authored · new fits unverified`);
    await expect(page.getByRole('button', { name: 'Enter post-assembly demonstration' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Collapse instructions' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Collapse inventory' })).toBeVisible();
    const assembled = await viewer.screenshot();
    expect(assembled.equals(before), 'Real staged assets must seat progressively rather than remain the initial inventory').toBe(false);
    if (build.id === 'package-sorter') {
      await page.getByRole('combobox', { name: 'Implemented source steps' }).selectOption('base2019-step53');
      await seek.fill('125850');
      await expect(page.getByLabel('Assembly counts')).toContainText('154/158');
      const selectedForkBracket = page.locator('.robot-scene [aria-hidden="true"] > div').filter({ hasText: 'base2019:angle-black-180:02' });
      await expect(selectedForkBracket, 'Automatic source-step camera must reveal the actual distant in-flight fork bracket').toBeVisible();
      await page.getByRole('button', { name: 'Reset view' }).click();
      await expect(page.locator('.camera-status')).toContainText('Manual camera');
      await page.getByRole('button', { name: 'Resume auto camera' }).click();
      await expect(selectedForkBracket).toBeVisible();
      await seek.fill(String(build.time));
      await expect(page.getByLabel('Assembly counts')).toContainText(build.units);
    }
    await page.getByRole('button', { name: 'Enter post-assembly demonstration' }).click();
    const region = page.getByRole('region', { name: 'Post-assembly simulation' });
    await expect(region.getByRole('combobox', { name: 'Scenario' })).toHaveValue(build.id === 'robotic-hand' ? 'hand-grip-hold-release-extension' : build.id === 'quality-check' ? 'quality-inspection-response-extension' : 'sorter-python-source-command-replay');
    await expect(region).toContainText(build.scenario);
    await expect(viewer).toHaveCount(1);
    const atZero = await viewer.screenshot();
    await region.getByRole('slider', { name: 'Simulation position' }).fill(String(build.demoTime));
    await expect(region.getByLabel('Sampled motor angles and sensor readings')).toContainText(build.reading);
    if (build.complete) expect((await viewer.screenshot()).equals(atZero), 'Powered mechanism must visibly move its existing real assembly').toBe(false);
    else {
      await expect(region).toContainText('pickup disabled');
      await expect(region).toContainText(/compound|linkage|fork/i);
      await region.getByRole('combobox', { name: 'Scenario' }).selectOption('sorter-svg-source-command-replay');
      await expect(region).toContainText('Source SVG motor replay — pickup disabled');
    }
    await region.getByRole('button', { name: 'Return to assembly end' }).click();
    await expect(seek).toHaveValue(String(build.time));
    await expect(page.getByRole('button', { name: 'Collapse instructions' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Collapse inventory' })).toBeVisible();
    await seek.fill('0');
    await expect(page.getByLabel('Assembly counts')).toContainText(build.id === 'quality-check' ? '0/55' : build.id === 'package-sorter' ? '0/158' : '0/39');
    await info.attach('post-assembly-reviewed-source', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    expect(errors, 'No source mesh or original prop may 404 and no WebGL exception may be hidden').toEqual([]);
  });
}
