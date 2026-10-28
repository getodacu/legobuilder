import { defineConfig } from '@playwright/test';

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:5187',
    viewport: { width: 1512, height: 982 },
    browserName: 'chromium',
    headless: true,
    launchOptions: executablePath ? { executablePath } : {},
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: [
    {
      command: 'npm run build && node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5187 --strictPort',
      url: 'http://127.0.0.1:5187',
      reuseExistingServer: false,
      timeout: 60_000
    },
    {
      command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5188 --strictPort',
      url: 'http://127.0.0.1:5188',
      reuseExistingServer: false,
      timeout: 60_000
    }
  ]
});
