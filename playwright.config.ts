import { defineConfig, devices } from '@playwright/test';

if (
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'demo-yttm-e2e' ||
  process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8086' ||
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9098'
) {
  throw new Error('Use yarn test:e2e to run against the isolated local emulators');
}
const live = process.env.E2E_LIVE_YOUTUBE === '1';
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: live ? '**/*.live.spec.ts' : '**/*.spec.ts',
  testIgnore: live ? [] : ['**/*.live.spec.ts'],
  fullyParallel: false,
  workers: 1,
  maxFailures: 1,
  retries: 0,
  outputDir: live ? 'test-results/live' : 'test-results/standard',
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: live ? 'playwright-report/live' : 'playwright-report/standard',
      },
    ],
  ],
  use: {
    baseURL: 'http://localhost:3100',
    channel:
      process.env.E2E_BROWSER_CHANNEL || (process.platform === 'darwin' ? 'chrome' : undefined),
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    ...(live ? [] : [{ name: 'mobile', use: { ...devices['Pixel 7'] } }]),
  ],
  webServer: {
    command: 'node node_modules/next/dist/bin/next dev --hostname localhost --port 3100',
    url: 'http://localhost:3100/login',
    reuseExistingServer: false,
    timeout: 120000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
  },
});
