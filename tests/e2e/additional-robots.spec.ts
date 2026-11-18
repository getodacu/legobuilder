import { test, expect } from '@playwright/test';
import { cameraView, chooseStep, openDetails, showParts, showReference, showWorkshop } from './ui';

const builds = [
  { id: 'robotic-hand', name: 'Robot Hand', units: '39/39', stages: '29/29', steps: '28/28', demoTime: 4200, scenario: /coupled grip, hold and release/i, complete: true },
  { id: 'quality-check', name: 'Quality Check Robot', units: '55/55', stages: '30/30', steps: '30/30', demoTime: 5300, scenario: /inspection-response demo/i, reading: /Sensor D: violet/, complete: true },
  { id: 'package-sorter', name: 'Package Sorter', units: '158/158', stages: '80/80', steps: '80/80', demoTime: 6000, scenario: /motor replay — pickup disabled/i, reading: /Port F:/, complete: false }
] as const;

for (const build of builds) {
  test(`${build.id}: source-linked assembly and actual post-assembly mechanism remain honest`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('requestfailed', (request) => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
    page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.emulateMedia({ reducedMotion: build.id === 'package-sorter' ? 'no-preference' : 'reduce' });
    await page.goto('/');
    await page.getByRole('button', { name: `Start ${build.name}`, exact: true }).click();
    await showWorkshop(page);
    const seek = page.getByRole('slider', { name: 'Assembly position' });
    const viewer = page.getByRole('img', { name: /^Interactive assembly/ });
    await expect(seek).toBeEnabled();
    await expect(page.locator('.robot-scene')).toHaveAttribute('aria-busy', 'false');
    const duration = (await seek.getAttribute('max'))!;
    const before = await cameraView(page).screenshot();
    await seek.fill(duration);
    await expect(page.getByLabel('Assembly counts')).toContainText(build.units);
    await expect(page.getByLabel('Assembly counts')).toContainText(build.stages);
    const references = await showReference(page);
    await references.getByText('Coverage & limitations', { exact: true }).click();
    await expect(references).toContainText(`${build.steps} steps implemented`);
    await expect(references.locator('.notice')).toContainText('not been fully verified on a physical robot');
    await references.getByRole('button', { name: 'Close reference' }).click();
    await showParts(page);
    await openDetails(page, '.view-options');
    await expect(page.getByRole('button', { name: 'Try the movement demo →' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Collapse instructions' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Collapse parts' })).toBeVisible();
    const assembled = await cameraView(page).screenshot();
    expect(assembled.equals(before), 'Real staged assets must seat progressively rather than remain the initial inventory').toBe(false);
    if (build.id === 'package-sorter') {
      await chooseStep(page, 'base2019-step53');
      const stepStart = Number(await seek.inputValue());
      await chooseStep(page, 'base2019-step54');
      const stepEnd = Number(await seek.inputValue());
      await seek.fill(String(Math.round((stepStart + stepEnd) / 2)));
      await expect(page.getByRole('link', { name: 'Official instructions · page 55 ↗' })).toHaveAttribute('href', /#page=55$/);
      expect((await cameraView(page).screenshot()).equals(assembled), 'Source-step camera and in-flight fork geometry must differ from the completed assembly').toBe(false);
      await openDetails(page, '.view-options');
      await page.getByRole('button', { name: 'Reset view' }).click();
      await expect(page.getByRole('button', { name: 'Resume auto camera' })).toBeVisible();
      await page.getByRole('button', { name: 'Resume auto camera' }).click();
      await expect(page.getByRole('checkbox', { name: 'Follow building steps' })).toBeChecked();
      await seek.fill(duration);
      await expect(page.getByLabel('Assembly counts')).toContainText(build.units);
    }
    await page.getByRole('button', { name: 'Try the movement demo →' }).click();
    const region = page.getByRole('region', { name: 'Post-assembly simulation' });
    await expect(region.getByRole('combobox', { name: 'Scenario' })).toHaveValue(build.id === 'robotic-hand' ? 'hand-grip-hold-release-extension' : build.id === 'quality-check' ? 'quality-inspection-response-extension' : 'sorter-python-source-command-replay');
    await expect(region).toContainText(build.scenario);
    await expect(viewer).toHaveCount(1);
    const atZero = await cameraView(page).screenshot();
    await region.getByRole('slider', { name: 'Simulation position' }).fill(String(build.demoTime));
    if ('reading' in build) await expect(region.getByLabel('Sampled motor angles and sensor readings')).toContainText(build.reading);
    if (build.complete) expect((await cameraView(page).screenshot()).equals(atZero), 'Powered mechanism must visibly move its existing real assembly').toBe(false);
    else {
      await expect(region).toContainText('pickup disabled');
      await region.getByRole('combobox', { name: 'Scenario' }).selectOption('sorter-svg-source-command-replay');
      await expect(region).toContainText('Source SVG motor replay — pickup disabled');
    }
    await region.getByRole('button', { name: 'Return to assembly end' }).click();
    await expect(seek).toHaveValue(duration);
    await expect(page.getByRole('button', { name: 'Collapse instructions' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Collapse parts' })).toBeVisible();
    await seek.fill('0');
    await expect(page.getByLabel('Assembly counts')).toContainText(build.id === 'quality-check' ? '0/55' : build.id === 'package-sorter' ? '0/158' : '0/39');
    await info.attach('post-assembly-reviewed-source', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    expect(errors, 'No source mesh or original prop may 404 and no WebGL exception may be hidden').toEqual([]);
  });
}
