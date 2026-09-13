import { defineConfig, devices } from '@playwright/test';

if (
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'demo-yttm-e2e' ||
  process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8086' ||
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9098'
) {
  throw new Error('Use yarn test:e2e to run against the isolated local emulators');
}
const live = process.env.E2E_LIVE_YOUTUBE === '1';
const webkit = process.env.E2E_WEBKIT === '1';
if (live && webkit) throw new Error('Run live YouTube and WebKit checks separately');
const suite = live ? 'live' : webkit ? 'webkit' : 'standard';
const webPort = process.env.E2E_PORT ?? '3100';
const baseURL = `http://localhost:${webPort}`;
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: live ? '**/*.live.spec.ts' : '**/*.spec.ts',
  testIgnore: live ? [] : ['**/*.live.spec.ts'],
  fullyParallel: false,
  workers: 1,
  maxFailures: 1,
  retries: 0,
  outputDir: `test-results/${suite}`,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: `playwright-report/${suite}`,
      },
    ],
  ],
  use: {
    baseURL,
    channel: webkit
      ? undefined
      : process.env.E2E_BROWSER_CHANNEL || (process.platform === 'darwin' ? 'chrome' : undefined),
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices[webkit ? 'Desktop Safari' : 'Desktop Chrome'] } },
    ...(live ? [] : [{ name: 'mobile', use: { ...devices[webkit ? 'iPhone 13' : 'Pixel 7'] } }]),
  ],
  webServer: {
    command: `node node_modules/next/dist/bin/next dev --hostname localhost --port ${webPort}`,
    url: `${baseURL}/login`,
    reuseExistingServer: false,
    timeout: 120000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
  },
});
