import { defineConfig, devices } from "@playwright/test";

const workers = process.env.CI ? 1 : undefined;
const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: !isCi,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  ...(workers !== undefined ? { workers } : {}),
  reporter: isCi ? [["github"], ["list"]] : "html",
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx next dev --port 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !isCi,
    timeout: 120_000,
  },
});
