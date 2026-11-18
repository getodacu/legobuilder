import { test, expect, type Locator, type Page, type TestInfo } from '@playwright/test';
import { cameraView, openDetails, showParts, showWorkshop } from './ui';

const failures = new WeakMap<Page, string[]>();
const geometryRequests = new WeakMap<Page, Set<string>>();
const viewer = (page: Page) => page.getByRole('img', { name: /^Interactive assembly/ });
const assemblySeek = (page: Page) => page.getByRole('slider', { name: /Assembly position/ });
const controls = (page: Page) => page.getByRole('region', { name: 'Post-assembly simulation', exact: true });
const simulationSeek = (page: Page) => controls(page).getByRole('slider', { name: /Simulation position/ });
const readings = (page: Page) => controls(page).getByLabel('Sampled motor angles and sensor readings');
const details = (page: Page) => controls(page).locator('.simulation-details');

// Per-page errors include real CAD/GLB failures, not just JavaScript exceptions.
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  failures.set(page, errors);
  geometryRequests.set(page, new Set());
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('requestfailed', (request) => errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    if (/\.(?:mpd|glb|gltf)(?:\?|$)/i.test(response.url())) geometryRequests.get(page)!.add(response.url());
  });
});

test.afterEach(async ({ page }, info) => {
  await info.attach('simulation-errors-and-assets', {
    body: JSON.stringify({ errors: failures.get(page), geometry: [...geometryRequests.get(page)!] }, null, 2),
    contentType: 'application/json'
  });
  expect(failures.get(page), 'No page error, failed request or missing source asset').toEqual([]);
});

async function capture(page: Page, info: TestInfo, name: string) {
  await info.attach(name, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
  await info.attach(`${name}-actual-canvas`, { body: await cameraView(page).screenshot(), contentType: 'image/png' });
}

async function expectComplete(page: Page) {
  const counts = page.getByLabel('Assembly counts');
  await expect(counts).toContainText('234/234');
  await expect(counts).toContainText('136/136');
}

async function openCompletedAssembly(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start Advanced Driving Base', exact: true }).click();
  await showWorkshop(page);
  await expect(assemblySeek(page)).toBeEnabled();
  await expect(page.locator('.robot-scene')).toHaveAttribute('aria-busy', 'false');
  await expect(viewer(page)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try the movement demo →', exact: true })).toHaveCount(0);
  // Completing the former seven-unit seed must not unlock a full-robot demonstration.
  await assemblySeek(page).fill('10000');
  await expect(page.getByLabel('Assembly counts')).toContainText('7/234');
  await expect(page.getByRole('button', { name: 'Try the movement demo →', exact: true })).toHaveCount(0);
  const end = Number(await assemblySeek(page).getAttribute('max'));
  expect(end).toBeGreaterThan(10000);
  await assemblySeek(page).fill(String(end - 1));
  await expect(page.getByRole('button', { name: 'Try the movement demo →', exact: true })).toHaveCount(0);
  await assemblySeek(page).fill(String(end));
  await expectComplete(page);
  await expect(page.getByRole('button', { name: 'Try the movement demo →', exact: true })).toBeEnabled();
  return end;
}

async function enterSimulation(page: Page) {
  await page.getByRole('button', { name: 'Try the movement demo →', exact: true }).click();
  await expect(controls(page)).toBeVisible();
  await expect(simulationSeek(page)).toHaveValue('0');
  await expect(controls(page).locator('.simulation-limits')).toContainText('Physical fit and real-world performance are unverified');
  if ((page.viewportSize()?.width ?? 0) >= 900) await expect(page.getByText('Simulation camera · manual orbit', { exact: true })).toBeVisible();
  if ((page.viewportSize()?.width ?? 0) >= 900) await openDetails(page, '.view-options');
  await expectComplete(page);
}

async function seek(page: Page, timeMs: number) {
  await simulationSeek(page).fill(String(timeMs));
  await expect(simulationSeek(page)).toHaveValue(String(timeMs));
  await expect(controls(page).locator('.simulation-position')).toContainText('paused');
}

async function expandEditors(page: Page) {
  if (await details(page).getAttribute('open') === null) {
    await details(page).getByText('Motor controls & technical notes', { exact: true }).click();
  }
}

async function selectPort(select: Locator, port: string) {
  const option = select.locator('option').filter({ hasText: new RegExp(`^Port ${port} ·`) });
  await expect(option).toHaveCount(1);
  await select.selectOption((await option.getAttribute('value'))!);
}

async function command(page: Page, port: string, value: number) {
  await expandEditors(page);
  await selectPort(controls(page).getByRole('combobox', { name: 'Motor / physical output', exact: true }), port);
  await controls(page).getByRole('combobox', { name: 'Command', exact: true }).selectOption('speed');
  await controls(page).getByRole('spinbutton', { name: 'Target (rad/s)', exact: true }).fill(String(value));
  await controls(page).getByRole('spinbutton', { name: 'Duration (ms)', exact: true }).fill('2000');
  await controls(page).getByRole('button', { name: 'Replace motor plan & reset', exact: true }).click();
  await expect(simulationSeek(page)).toHaveValue('0');
  await expect(controls(page).getByRole('status').filter({ hasText: `Replaced only port ${port}` })).toBeVisible();
  await expect(controls(page).getByRole('alert')).toHaveCount(0);
}

async function angle(page: Page, port: string) {
  const text = await readings(page).locator('span').filter({ hasText: new RegExp(`^Port ${port}:`) }).innerText();
  const match = text.match(/: (-?\d+\.\d+) rad$/);
  expect(match, `Port ${port} exposes its actual sampled revolute coordinate`).not.toBeNull();
  return Number(match![1]);
}

async function sensor(page: Page, port: string, value: string) {
  await expect(readings(page).getByText(`Sensor ${port}: ${value}`, { exact: true })).toBeVisible();
}

// Compare fresh app screenshots, not golden snapshots or private Three/Svelte state.
// Ignore small antialiasing differences; only substantial RGB changes count.
async function changedFraction(page: Page, before: Buffer, after: Buffer) {
  return page.evaluate(async ([a, b]) => {
    async function decode(base64: string) {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return { width: canvas.width, height: canvas.height, pixels: context.getImageData(0, 0, canvas.width, canvas.height).data };
    }
    const [left, right] = await Promise.all([decode(a), decode(b)]);
    if (left.width !== right.width || left.height !== right.height) throw new Error('Canvas dimensions changed during a fixed-camera comparison');
    let changed = 0;
    for (let i = 0; i < left.pixels.length; i += 4) {
      if (Math.abs(left.pixels[i] - right.pixels[i]) + Math.abs(left.pixels[i + 1] - right.pixels[i + 1]) + Math.abs(left.pixels[i + 2] - right.pixels[i + 2]) > 60) changed++;
    }
    return changed / (left.width * left.height);
  }, [before.toString('base64'), after.toString('base64')]);
}


async function isolatePart(page: Page, id: string) {
  const toggle = page.getByRole('button', { name: 'Parts', exact: true });
  if (await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
  const inventory = page.getByRole('complementary', { name: 'Parts and inspection' });
  await inventory.getByRole('button', { name: 'All parts', exact: true }).click();
  await inventory.getByRole('searchbox').fill(id);
  await inventory.locator('.inventory-list button').filter({ has: page.getByText(id, { exact: true }) }).click();
  await expect(inventory.locator('.inspector-facts')).toContainText(id);
  await inventory.getByRole('button', { name: 'Isolate part', exact: true }).click();
  await inventory.getByRole('button', { name: 'Collapse parts', exact: true }).click();
  await page.getByRole('button', { name: 'Focus active', exact: true }).click();
}

// Independent integral of the documented app-authored A/E command schedule.
// The truthful UI cutoff, if present, bounds integration; this is not a second engine call.
function wheelReference(port: 'A' | 'E', time: number) {
  const phases = [[0, 4000, 2, 2], [4000, 6000, 1, 2], [6000, 10000, 2, 2], [10000, 12000, 2, 1], [12000, 16000, 2, 2]];
  return phases.reduce((sum, [start, end, a, e]) => sum + Math.max(0, Math.min(time, end) - start) / 1000 * (port === 'A' ? a : e), 0);
}

test('full source assembly enters the same actual scene; guarded course, replay and return preserve all 234 units', async ({ page }, info) => {
  const end = await openCompletedAssembly(page);
  await showParts(page);
  const inventory = page.getByRole('complementary', { name: 'Parts and inspection' });
  await expect(inventory.locator('.instance-list > li')).toHaveCount(234);
  await expect(inventory.locator('.inventory-list .part-state')).toHaveText(Array(234).fill('Placed'));
  const originalCanvas = await viewer(page).elementHandle();
  expect(originalCanvas).not.toBeNull();
  const assetsBeforeEntry = [...geometryRequests.get(page)!].sort();
  const manifest = await (await page.request.get('/models/advanced-driving-base/manifest.json')).json() as { geometryAssets: { format: string; url: string }[] };
  const requiredMpd = manifest.geometryAssets.filter((asset) => asset.format === 'mpd').map((asset) => new URL(asset.url, page.url()).href).sort();
  expect(assetsBeforeEntry.filter((url) => /\.mpd(?:\?|$)/i.test(url)), 'Every authored licensed root must load from its actual MPD before the completed scene is shown').toEqual(requiredMpd);
  expect(assetsBeforeEntry.some((url) => url.endsWith('/models/simulation/course-marker.glb'))).toBe(true);
  // Match the wide simulation layout before comparing actual geometry pixels.
  await page.getByRole('button', { name: 'Collapse instructions', exact: true }).click();
  await inventory.getByRole('button', { name: 'Collapse parts', exact: true }).click();
  await openDetails(page, '.view-options');
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await page.getByRole('button', { name: 'Fit whole', exact: true }).click();
  const assemblyPixels = await cameraView(page).screenshot();
  await enterSimulation(page);
  await expect(viewer(page)).toHaveCount(1);
  expect(await viewer(page).evaluate((canvas, original) => canvas === original, originalCanvas)).toBe(true);
  expect([...geometryRequests.get(page)!].sort(), 'Entry reuses loaded genuine CAD rather than requesting a replacement robot').toEqual(assetsBeforeEntry);
  await page.getByRole('button', { name: 'Fit whole', exact: true }).click();
  const startPixels = await cameraView(page).screenshot();
  await capture(page, info, 'simulation-start-original-course');
  const collision = controls(page).locator('.simulation-collision');
  await expect(collision).toContainText('Simplified collision stop, no physics');
  const stop = (await collision.innerText()).match(/Both wheel plans stop safely at (\d+\.\d+) s/);
  const cutoff = stop ? Number(stop[1]) * 1000 : Number(await simulationSeek(page).getAttribute('max'));
  expect(cutoff, 'The original course permits actual initial drive motion').toBeGreaterThan(0);
  for (const port of ['A', 'E', 'C', 'D']) expect(await angle(page, port)).toBe(0);
  await sensor(page, 'B', 'white'); await sensor(page, 'F', 'white');
  const saved = new Map<number, { pixels: Buffer; state: string[] }>();
  for (const time of [6000, 12000, 0, 12000, 6000]) {
    await seek(page, time);
    for (const port of ['A', 'E'] as const) expect(await angle(page, port)).toBeCloseTo(wheelReference(port, Math.min(time, cutoff)), 2);
    for (const port of ['C', 'D']) expect(await angle(page, port)).toBe(0);
    await sensor(page, 'B', time === 6000 ? 'black' : 'white');
    await sensor(page, 'F', time === 6000 ? 'black' : 'white');
    await expectComplete(page);
    const pixels = await cameraView(page).screenshot();
    const state = await readings(page).locator('span').allTextContents();
    const previous = saved.get(time);
    if (previous) {
      expect(state, 'Random/reverse seeks restore sampled motor and sensor values').toEqual(previous.state);
      expect(await changedFraction(page, previous.pixels, pixels), 'Same timestamp restores geometry and retains manual camera').toBeLessThan(0.001);
    } else saved.set(time, { pixels, state });
  }
  expect(await changedFraction(page, startPixels, saved.get(6000)!.pixels), 'Actual robot geometry moves through the fixed-camera course').toBeGreaterThan(0.001);
  await capture(page, info, 'simulation-intermediate-guarded-trajectory');
  await controls(page).getByRole('combobox', { name: 'Speed', exact: true }).selectOption('0.25');
  await controls(page).getByRole('button', { name: 'Reverse', exact: true }).click();
  await expect.poll(async () => Number(await simulationSeek(page).inputValue())).toBeLessThan(5900);
  await controls(page).getByRole('button', { name: 'Pause', exact: true }).click();
  const paused = await simulationSeek(page).inputValue();
  await expect(controls(page).locator('.simulation-position')).toContainText('paused');
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await expect(simulationSeek(page)).toHaveValue(paused);
  await controls(page).getByRole('button', { name: 'Play demonstration', exact: true }).click();
  await expect.poll(async () => Number(await simulationSeek(page).inputValue())).toBeGreaterThan(Number(paused));
  const full = Number(await simulationSeek(page).getAttribute('max'));
  await seek(page, full);
  await expect(controls(page).getByRole('button', { name: 'Play demonstration', exact: true })).toBeDisabled();
  await expectComplete(page);
  await capture(page, info, 'simulation-complete-source-limitations');
  await controls(page).getByRole('button', { name: 'Return to assembly end', exact: true }).click();
  await expect(controls(page)).toHaveCount(0);
  await expect(assemblySeek(page)).toHaveValue(String(end));
  await expectComplete(page);
  expect(await viewer(page).evaluate((canvas, original) => canvas === original, originalCanvas)).toBe(true);
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await page.getByRole('button', { name: 'Fit whole', exact: true }).click();
  expect(await changedFraction(page, assemblyPixels, await cameraView(page).screenshot()), 'Returning restores the same complete assembly without external simulation objects').toBeLessThan(0.001);
  await enterSimulation(page);
  expect(await viewer(page).evaluate((canvas, original) => canvas === original, originalCanvas)).toBe(true);
  await page.getByRole('button', { name: 'Fit whole', exact: true }).click();
  expect(await changedFraction(page, startPixels, await cameraView(page).screenshot()), 'Re-entry restores the original course and robot at zero without stale transforms').toBeLessThan(0.001);
  await expect(simulationSeek(page)).toHaveValue('0');
});

test('native motor plans move actual independent C/D gears; typed B/F events rewind, reset preserves edits and restore clears them', async ({ page }, info) => {
  await openCompletedAssembly(page); await enterSimulation(page); await expandEditors(page);
  const motor = controls(page).getByRole('combobox', { name: 'Motor / physical output', exact: true });
  await expect(motor.locator('option')).toHaveCount(4);
  for (const port of ['A', 'E', 'C', 'D']) await expect(motor.locator('option').filter({ hasText: new RegExp(`^Port ${port} ·`) })).toHaveCount(1);
  await isolatePart(page, 'left-wheel');
  const drivenWheelAtZero = await cameraView(page).screenshot();
  await seek(page, 1000);
  // Recenter the same real wheel to remove chassis translation from this comparison.
  await page.getByRole('button', { name: 'Focus active', exact: true }).click();
  expect(await angle(page, 'A')).toBeGreaterThan(0);
  expect(await changedFraction(page, drivenWheelAtZero, await cameraView(page).screenshot()), 'Actual powered wheel rotates, not only its text readout').toBeGreaterThan(0.002);
  await capture(page, info, 'simulation-actual-drive-wheel-rotation');
  // Isolate tool actuation from root/wheel motion using actual native commands.
  await command(page, 'A', 0); await command(page, 'E', 0);
  await command(page, 'D', 0.5);
  await page.getByRole('button', { name: 'Focus active', exact: true }).click();
  const stoppedWheel = await cameraView(page).screenshot();
  await seek(page, 1000);
  expect(await changedFraction(page, stoppedWheel, await cameraView(page).screenshot()), 'Independent D actuation leaves the actual isolated drive wheel unchanged').toBeLessThan(0.001);
  await seek(page, 0);
  await isolatePart(page, 'front-gear28');
  const frontAtZero = await cameraView(page).screenshot();
  await seek(page, 1000);
  expect(await angle(page, 'A')).toBe(0); expect(await angle(page, 'E')).toBe(0);
  expect(await angle(page, 'C')).toBe(0); expect(await angle(page, 'D')).toBeCloseTo(0.5, 3);
  const frontMoving = await cameraView(page).screenshot();
  expect(await changedFraction(page, frontAtZero, frontMoving), 'Real front output gear rotates while the drive wheels remain at zero').toBeGreaterThan(0.002);
  await capture(page, info, 'simulation-front-D-actual-gear-during-motion');
  await command(page, 'C', -0.4); await seek(page, 1000);
  expect(await angle(page, 'C')).toBeCloseTo(-0.4, 3); expect(await angle(page, 'D')).toBeCloseTo(0.5, 3);
  expect(await angle(page, 'A')).toBe(0); expect(await angle(page, 'E')).toBe(0);
  expect(await changedFraction(page, frontMoving, await cameraView(page).screenshot()), 'C edit does not replace D plan or perturb its rendered gear').toBeLessThan(0.001);
  await isolatePart(page, 'rear-output-gear');
  const rearMoving = await cameraView(page).screenshot();
  await seek(page, 0);
  expect(await changedFraction(page, rearMoving, await cameraView(page).screenshot()), 'Real rear output gear independently rotates').toBeGreaterThan(0.002);
  await seek(page, 1000);
  await page.getByRole('button', { name: 'Technical', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Technical', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await capture(page, info, 'simulation-rear-C-gear-technical-motion');
  const input = controls(page).getByRole('combobox', { name: 'Sensor', exact: true });
  await expect(input.locator('option')).toHaveCount(2);
  for (const [port, color] of [['B', 'red'], ['F', 'blue']]) {
    await selectPort(input, port);
    await controls(page).getByRole('combobox', { name: 'Color', exact: true }).selectOption(color);
    await controls(page).getByRole('button', { name: 'Record color event', exact: true }).click();
    await expect(controls(page).getByRole('status').filter({ hasText: `Recorded ${color} at 1.00 s` })).toBeVisible();
    await expect(details(page).getByRole('listitem').filter({ hasText: `1.00 s · ${port} · color: ${color} · scripted-input` })).toHaveCount(1);
    await sensor(page, port, color);
  }
  await expect(details(page)).toContainText('No optical, distance, light or hardware readings are invented.');
  await expect(details(page).locator('ol > li')).toHaveCount(6);
  await seek(page, 999); await sensor(page, 'B', 'white'); await sensor(page, 'F', 'white');
  await seek(page, 1000); await sensor(page, 'B', 'red'); await sensor(page, 'F', 'blue');
  await seek(page, 6000); await sensor(page, 'B', 'black'); await sensor(page, 'F', 'black');
  await seek(page, 12000); await sensor(page, 'B', 'white'); await sensor(page, 'F', 'white');
  await controls(page).getByRole('button', { name: 'Reset time', exact: true }).click();
  await expect(simulationSeek(page)).toHaveValue('0');
  await expect(details(page).locator('ol > li')).toHaveCount(6);
  await seek(page, 1000);
  expect(await angle(page, 'D')).toBeCloseTo(0.5, 3); expect(await angle(page, 'C')).toBeCloseTo(-0.4, 3);
  await sensor(page, 'B', 'red'); await sensor(page, 'F', 'blue');
  await controls(page).getByRole('button', { name: 'Restore scenario', exact: true }).click();
  await expect(simulationSeek(page)).toHaveValue('0');
  await expect(details(page).locator('ol > li')).toHaveCount(0);
  await expect(details(page)).toContainText('No manual edits. Restore scenario clears edits; Reset time preserves them.');
  await expect(details(page).getByRole('listitem').filter({ hasText: /color: (red|blue) · scripted-input/ })).toHaveCount(0);
  await sensor(page, 'B', 'white'); await sensor(page, 'F', 'white');
  await seek(page, 1000);
  expect(await angle(page, 'D')).toBe(0); expect(await angle(page, 'C')).toBe(0);
  await expectComplete(page);
  if (await page.locator('.view-options').getAttribute('open') !== null) await page.locator('.view-options > summary').click();
  await page.getByRole('button', { name: 'Show all parts', exact: true }).click();
  await openDetails(page, '.view-options');
  await page.getByRole('button', { name: 'Studio', exact: true }).click();
  await page.getByRole('button', { name: 'Fit whole', exact: true }).click();
  await capture(page, info, 'simulation-restored-scenario-and-typed-input-limitations');
});

test('320px simulation transport and native editors remain accessible and operable without horizontal overflow', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openCompletedAssembly(page); await enterSimulation(page);
  const noOverflow = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await noOverflow();
  await seek(page, 6000);
  await controls(page).getByRole('combobox', { name: 'Speed', exact: true }).selectOption('0.5');
  await controls(page).getByRole('button', { name: 'Reverse', exact: true }).click();
  await expect.poll(async () => Number(await simulationSeek(page).inputValue())).toBeLessThan(5900);
  await controls(page).getByRole('button', { name: 'Pause', exact: true }).click();
  await command(page, 'D', 0.25);
  await seek(page, 1000);
  expect(await angle(page, 'D')).toBeCloseTo(0.25, 3);
  await selectPort(controls(page).getByRole('combobox', { name: 'Sensor', exact: true }), 'B');
  await controls(page).getByRole('combobox', { name: 'Color', exact: true }).selectOption('green');
  await controls(page).getByRole('button', { name: 'Record color event', exact: true }).click();
  await sensor(page, 'B', 'green');
  await noOverflow();
  await capture(page, info, 'simulation-320-native-controls-and-source-limitations');
  await controls(page).getByRole('button', { name: 'Reset time', exact: true }).click();
  await expect(simulationSeek(page)).toHaveValue('0');
  await controls(page).getByRole('button', { name: 'Restore scenario', exact: true }).click();
  await controls(page).getByRole('button', { name: 'Return to assembly end', exact: true }).click();
  await expectComplete(page);
  await expect(page.getByRole('button', { name: 'Try the movement demo →', exact: true })).toBeEnabled();
  await noOverflow();
});
