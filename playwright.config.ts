import { defineConfig, devices } from '@playwright/test';

// E2E tests drive the real production build in a browser. The webServer builds the
// app and serves the preview; tests run against that.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // `list` for console; `html` is uploaded as a CI artifact so failures are debuggable.
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry', // full trace captured on the retry of any failure
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // The cockpit targets wide desktop displays ("very wide, not high"); 1440x900 is the
  // realistic minimum where the no-scroll cluster is designed to fit. Test at that size,
  // not Desktop Chrome's default 1280x720 (too short for the instrument density).
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
