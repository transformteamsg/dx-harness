import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // `pnpm start` nests pnpm -> sh -> next-server. Without a kill deadline,
    // a next-server that outlives SIGTERM leaves Playwright waiting on it
    // after the last test, with no timeout covering that window.
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
  },
});
