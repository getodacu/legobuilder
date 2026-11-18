import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const origin = process.argv[2];
if (!origin) throw new Error('Usage: npm run models:part-previews -- http://127.0.0.1:5179/');
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH });
try {
  const page = await browser.newPage();
  await page.goto(origin);
  const images: Record<string, string> = await page.evaluate(async () => {
    // Run with Vite's browser transforms, not the Node loader.
    const module = '/src/lib/scene/render-part-previews.ts';
    const { renderPreviews } = await import(/* @vite-ignore */ module);
    return renderPreviews();
  });
  const output = new URL('../../static/previews/parts/', import.meta.url);
  await mkdir(output, { recursive: true });
  await Promise.all(Object.entries(images).map(async ([name, base64]) => {
    const image = Buffer.from(base64, 'base64');
    if (image.toString('ascii', 0, 4) !== 'RIFF' || image.toString('ascii', 8, 12) !== 'WEBP') throw new Error(`Not a WebP: ${name}`);
    await writeFile(new URL(name, output), image);
  }));
  console.log(`Wrote ${Object.keys(images).length} LDraw part previews to static/previews/parts/`);
} finally { await browser.close(); }
